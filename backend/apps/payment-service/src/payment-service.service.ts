import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Prisma } from '@prisma/client/payment/index.js';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONFIG, createEventHeaders } from '@app/shared';

@Injectable()
export class PaymentServiceService {
  constructor(
    private prisma: PrismaService,
    private amqpConnection: AmqpConnection,
  ) {}

  async initWallet(userId: string) {
    // Return existing or create new
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId },
      });
    }
    return wallet;
  }

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!wallet) {
      const newWallet = await this.initWallet(userId);
      return { ...newWallet, transactions: [] };
    }
    return wallet;
  }

  async depositTestMoney(userId: string, amount: number) {
    if (!amount || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Số tiền nạp không hợp lệ (phải lớn hơn 0)');
    }

    let wallet = await this.getWallet(userId);

    const updatedWallet = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { userId },
        data: {
          availableBalance: { increment: amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'DEPOSIT',
          status: 'SUCCESS',
        },
      });

      return wallet;
    });

    // Chỉ publish thông báo khi transaction DB đã commit thành công!
    await this.amqpConnection.publish(
      RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
      RABBITMQ_CONFIG.ROUTING_KEYS.PAYMENT_DEPOSIT,
      {
        userId: userId,
        title: 'Nạp tiền thành công',
        content: `Bạn đã nạp thành công ${Number(amount).toLocaleString('vi-VN')} đ vào ví Khả dụng.`,
        type: 'PAYMENT',
        link: '/wallet',
      },
      {
        headers: createEventHeaders('payment-service'),
        persistent: true,
      },
    );

    return updatedWallet;
  }

  async withdrawTestMoney(userId: string, amount: number) {
    if (!amount || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Số tiền rút không hợp lệ (phải lớn hơn 0)');
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || Number(wallet.availableBalance) < amount) {
        throw new BadRequestException('Số dư khả dụng không đủ để rút');
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          availableBalance: { decrement: amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          amount,
          type: 'WITHDRAWAL',
          status: 'SUCCESS',
        },
      });

      return updatedWallet;
    });
  }

  async escrowHold(data: {
    userId: string;
    amount: number;
    idempotencyKey: string;
  }) {
    const { userId, amount, idempotencyKey } = data;
    const existingKey = await this.prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey },
    });
    if (existingKey) {
      return existingKey.responsePayload;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra ví và số dư khả dụng an toàn ngay trong transaction
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || Number(wallet.availableBalance) < amount) {
        throw new BadRequestException(
          'Số dư khả dụng không đủ để thanh toán Escrow',
        );
      }

      // 2. Giam tiền khả dụng và chuyển sang Escrow
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          availableBalance: { decrement: amount },
          escrowBalance: { increment: amount },
        },
      });

      // 3. Tạo Transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          amount,
          type: 'ESCROW_HOLD',
          status: 'SUCCESS',
        },
      });

      const response = { success: true, transactionId: transaction.id };

      // 4. Ghi nhận Idempotency
      await tx.idempotencyRecord.create({
        data: {
          key: idempotencyKey,
          responsePayload: response as any,
        },
      });

      return response;
    });

    return result;
  }

  async escrowRelease(data: {
    clientId: string;
    freelancerId: string;
    milestoneId: string;
    amount: number;
    idempotencyKey: string;
  }) {
    const { clientId, freelancerId, milestoneId, amount, idempotencyKey } =
      data;

    // Check Idempotency
    const existingKey = await this.prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey },
    });
    if (existingKey) {
      return existingKey.responsePayload;
    }

    const freelancerWallet = await this.getWallet(freelancerId);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra Escrow balance của Client ngay trong transaction
      const clientWallet = await tx.wallet.findUnique({ where: { userId: clientId } });
      if (!clientWallet || Number(clientWallet.escrowBalance) < amount) {
        throw new BadRequestException('Số dư Escrow của Client không đủ');
      }

      // 2. Trừ Escrow của Client
      await tx.wallet.update({
        where: { userId: clientId },
        data: { escrowBalance: { decrement: amount } },
      });

      // 3. Cộng Tiền khả dụng cho Freelancer
      await tx.wallet.update({
        where: { userId: freelancerId },
        data: { availableBalance: { increment: amount } },
      });

      // 4. Tạo Transaction Release
      const transaction = await tx.transaction.create({
        data: {
          walletId: freelancerWallet?.id,
          milestoneId,
          amount,
          type: 'ESCROW_RELEASE',
          status: 'SUCCESS',
        },
      });
      const response = { success: true, transactionId: transaction.id };
      await tx.idempotencyRecord.create({
        data: {
          key: idempotencyKey,
          responsePayload: response as any,
        },
      });

      return response;
    });

    // Notify freelancer that escrow was released (chuẩn hóa tiền tệ VNĐ)
    await this.amqpConnection.publish(
      RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
      RABBITMQ_CONFIG.ROUTING_KEYS.ESCROW_RELEASED,
      {
        userId: freelancerId,
        title: 'Tiền đã về ví!',
        content: `Khách hàng đã giải ngân ${Number(amount).toLocaleString('vi-VN')} đ cho bạn. Số tiền này đã cộng vào số dư khả dụng.`,
        type: 'PAYMENT',
        relatedEntityId: milestoneId,
        link: '/wallet',
      },
      {
        headers: createEventHeaders('payment-service'),
        persistent: true,
      },
    );

    return result;
  }

  async escrowRefund(data: {
    clientId: string;
    amount: number;
    idempotencyKey: string;
    contractId?: string;
    reason?: string;
  }) {
    const { clientId, amount, idempotencyKey, contractId } = data;

    // Check Idempotency
    const existingKey = await this.prisma.idempotencyRecord.findUnique({
      where: { key: idempotencyKey },
    });
    if (existingKey) {
      return existingKey.responsePayload;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra ví Client
      const clientWallet = await tx.wallet.findUnique({ where: { userId: clientId } });
      if (!clientWallet || Number(clientWallet.escrowBalance) < amount) {
        throw new BadRequestException('Số dư Escrow của Client không đủ để hoàn tiền');
      }

      // 2. Trừ tiền Escrow và hoàn lại vào Available Balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: clientId },
        data: {
          escrowBalance: { decrement: amount },
          availableBalance: { increment: amount },
        },
      });

      // 3. Tạo Transaction Refund
      const transaction = await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          amount,
          type: 'REFUND',
          status: 'SUCCESS',
        },
      });

      const response = { success: true, transactionId: transaction.id, refundedAmount: amount };

      // 4. Ghi Idempotency
      await tx.idempotencyRecord.create({
        data: {
          key: idempotencyKey,
          responsePayload: response as any,
        },
      });

      return response;
    });

    // Bắn thông báo hoàn tiền về ví
    try {
      await this.amqpConnection.publish(
        RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
        RABBITMQ_CONFIG.ROUTING_KEYS.PAYMENT_DEPOSIT,
        {
          userId: clientId,
          title: 'Hoàn tiền Escrow về ví thành công',
          content: `Số tiền ${Number(amount).toLocaleString('vi-VN')} đ từ hợp đồng đã được hoàn trả lại vào số dư khả dụng của bạn.`,
          type: 'PAYMENT',
          relatedEntityId: contractId,
          link: '/wallet',
        },
        {
          headers: createEventHeaders('payment-service'),
          persistent: true,
        },
      );
    } catch (e) {
      console.error('Lỗi khi gửi thông báo RabbitMQ hoàn tiền:', e);
    }

    return result;
  }

  // --- ADMIN APIs ---

  async getFinanceStats() {
    const totalEscrow = await this.prisma.wallet.aggregate({
      _sum: { escrowBalance: true },
    });
    
    const totalFees = await this.prisma.transaction.aggregate({
      _sum: { feeAmount: true },
      where: { status: 'SUCCESS' },
    });

    const pendingWithdrawalsCount = await this.prisma.withdrawalRequest.count({
      where: { status: 'PENDING' },
    });

    return {
      totalEscrow: totalEscrow._sum.escrowBalance || 0,
      totalFees: totalFees._sum.feeAmount || 0,
      pendingWithdrawals: pendingWithdrawalsCount,
    };
  }

  async getAllWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveWithdrawal(id: string, adminNote?: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!request || request.status !== 'PENDING') {
      throw new BadRequestException('Lệnh rút tiền không tồn tại hoặc đã được xử lý');
    }

    return this.prisma.withdrawalRequest.update({
      where: { id },
      data: { status: 'APPROVED', adminNote },
    });
  }

  async rejectWithdrawal(id: string, adminNote?: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!request || request.status !== 'PENDING') {
      throw new BadRequestException('Lệnh rút tiền không tồn tại hoặc đã được xử lý');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark as rejected
      const updatedReq = await tx.withdrawalRequest.update({
        where: { id },
        data: { status: 'REJECTED', adminNote },
      });

      // 2. Refund balance
      await tx.wallet.update({
        where: { userId: request.userId },
        data: { availableBalance: { increment: request.amount } },
      });

      // 3. (Optional) Create Refund Transaction
      const wallet = await tx.wallet.findUnique({ where: { userId: request.userId } });
      if (wallet) {
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: request.amount,
            type: 'REFUND',
            status: 'SUCCESS',
          }
        });
      }

      return updatedReq;
    });
  }
}
