import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { DashboardController } from './dashboard.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { getTcpClient } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      getTcpClient('PAYMENT_SERVICE'),
      getTcpClient('CONTRACT_SERVICE'),
      getTcpClient('PROJECT_SERVICE'),
    ]),
    JwtModule.register({}),
  ],
  controllers: [DashboardController],
  providers: [AuthGuard],
})
export class DashboardModule {}
