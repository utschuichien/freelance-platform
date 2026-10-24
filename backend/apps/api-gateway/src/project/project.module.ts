import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ProjectController } from './project.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { getTcpClient } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      getTcpClient('PROJECT_SERVICE'),
      getTcpClient('AUTH_SERVICE'),
      getTcpClient('USER_SERVICE'),
      getTcpClient('CONTRACT_SERVICE'),
      getTcpClient('PAYMENT_SERVICE'),
    ]),
    JwtModule.register({}),
  ],
  controllers: [ProjectController],
  providers: [AuthGuard, RolesGuard],
})
export class ProjectModule {}
