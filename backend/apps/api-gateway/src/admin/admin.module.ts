import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { getTcpClient } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      getTcpClient('AUTH_SERVICE'),
      getTcpClient('USER_SERVICE'),
      getTcpClient('PAYMENT_SERVICE'),
      getTcpClient('PROJECT_SERVICE'),
      getTcpClient('CONTRACT_SERVICE'),
    ]),
    JwtModule.register({}),
  ],
  controllers: [AdminController],
  providers: [AuthGuard, RolesGuard],
})
export class AdminModule {}
