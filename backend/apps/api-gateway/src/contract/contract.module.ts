import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ContractController } from './contract.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { getTcpClient } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      getTcpClient('CONTRACT_SERVICE'),
      getTcpClient('PAYMENT_SERVICE'),
      getTcpClient('PROJECT_SERVICE'),
      getTcpClient('AUTH_SERVICE'),
    ]),
    JwtModule.register({}),
  ],
  controllers: [ContractController],
  providers: [AuthGuard, RolesGuard],
})
export class ContractModule {}
