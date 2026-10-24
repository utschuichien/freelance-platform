import { Controller, Get, Post, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PAYMENT_PATTERNS, CONTRACT_PATTERNS, DepositMoneyDto, WithdrawMoneyDto } from '@app/shared';

@Controller('api/payments')
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
    @Inject('CONTRACT_SERVICE') private contractClient: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Get('wallet')
  async getWallet(@CurrentUser('userId') userId: string) {
    const wallet = await firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.GET_WALLET, { userId })
    );

    if (wallet && wallet.transactions) {
      wallet.transactions = await Promise.all(
        wallet.transactions.map(async (tx: any) => {
          let description = '';
          
          if (tx.type === 'DEPOSIT') {
            description = 'Nạp tiền vào ví khả dụng';
          } else if (tx.type === 'WITHDRAWAL') {
            description = 'Rút tiền về tài khoản ngân hàng';
          } else if (tx.type === 'ESCROW_HOLD' || tx.type === 'ESCROW_RELEASE') {
            if (tx.milestoneId) {
              try {
                const m = await firstValueFrom(
                  this.contractClient.send(CONTRACT_PATTERNS.GET_MILESTONE, { id: tx.milestoneId })
                ).catch(() => null);
                
                if (m && m.title) {
                  description = tx.type === 'ESCROW_HOLD' 
                    ? `Khóa tiền Escrow cho Giai đoạn: ${m.title}`
                    : `Giải ngân cho Giai đoạn: ${m.title}`;
                }
              } catch (e) {}
            }
            if (!description) {
              description = tx.type === 'ESCROW_HOLD' 
                ? 'Khóa tiền Escrow cho dự án'
                : 'Giải ngân tiền Escrow';
            }
          }

          return {
            ...tx,
            description,
          };
        })
      );
    }

    return wallet;
  }

  @UseGuards(AuthGuard)
  @Post('deposit')
  async deposit(
    @Body() data: DepositMoneyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return await firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.DEPOSIT, { userId, amount: data.amount })
    );
  }

  @UseGuards(AuthGuard)
  @Post('withdraw')
  async withdraw(
    @Body() data: WithdrawMoneyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return await firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.WITHDRAW, { userId, amount: data.amount })
    );
  }
}

