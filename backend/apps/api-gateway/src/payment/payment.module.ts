import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { PaymentController } from './payment.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { getTcpClient } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      getTcpClient('PAYMENT_SERVICE'),
      getTcpClient('CONTRACT_SERVICE'),
    ]),
    JwtModule.register({}),
  ],
  controllers: [PaymentController],
  providers: [AuthGuard, RolesGuard],
})
export class PaymentModule {}
