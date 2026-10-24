import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentServiceService } from './payment-service.service';
import { PAYMENT_PATTERNS } from '@app/shared';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentService: PaymentServiceService) {}

  @MessagePattern(PAYMENT_PATTERNS.INIT_WALLET)
  async initWallet(@Payload() data: { userId: string }) {
    return this.paymentService.initWallet(data.userId);
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_WALLET)
  async getWallet(@Payload() data: { userId: string }) {
    return this.paymentService.getWallet(data.userId);
  }

  @MessagePattern(PAYMENT_PATTERNS.DEPOSIT)
  async deposit(@Payload() data: { userId: string; amount: number }) {
    return this.paymentService.depositTestMoney(data.userId, data.amount);
  }

  @MessagePattern(PAYMENT_PATTERNS.WITHDRAW)
  async withdraw(@Payload() data: { userId: string; amount: number }) {
    return this.paymentService.withdrawTestMoney(data.userId, data.amount);
  }

  @MessagePattern(PAYMENT_PATTERNS.ESCROW_HOLD)
  async escrowHold(
    @Payload() data: { userId: string; amount: number; idempotencyKey: string },
  ) {
    return this.paymentService.escrowHold(data);
  }

  @MessagePattern(PAYMENT_PATTERNS.ESCROW_RELEASE)
  async escrowRelease(
    @Payload()
    data: {
      clientId: string;
      freelancerId: string;
      milestoneId: string;
      amount: number;
      idempotencyKey: string;
    },
  ) {
    return this.paymentService.escrowRelease(data);
  }

  @MessagePattern(PAYMENT_PATTERNS.ESCROW_REFUND)
  async escrowRefund(
    @Payload()
    data: {
      clientId: string;
      amount: number;
      idempotencyKey: string;
      contractId?: string;
      reason?: string;
    },
  ) {
    return this.paymentService.escrowRefund(data);
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_FINANCE_STATS)
  async getFinanceStats() {
    return this.paymentService.getFinanceStats();
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_ALL_WITHDRAWALS)
  async getAllWithdrawals() {
    return this.paymentService.getAllWithdrawals();
  }

  @MessagePattern(PAYMENT_PATTERNS.APPROVE_WITHDRAWAL)
  async approveWithdrawal(@Payload() data: { id: string; adminNote?: string }) {
    return this.paymentService.approveWithdrawal(data.id, data.adminNote);
  }

  @MessagePattern(PAYMENT_PATTERNS.REJECT_WITHDRAWAL)
  async rejectWithdrawal(@Payload() data: { id: string; adminNote?: string }) {
    return this.paymentService.rejectWithdrawal(data.id, data.adminNote);
  }
}
