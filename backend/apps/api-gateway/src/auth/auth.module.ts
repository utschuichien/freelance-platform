import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { FreelancerController } from './freelancer.controller';
import { JwtModule } from '@nestjs/jwt';
import { getTcpClient } from '@app/shared';

@Module({
  imports: [
    ClientsModule.register([
      getTcpClient('AUTH_SERVICE'),
      getTcpClient('USER_SERVICE'),
      getTcpClient('CONTRACT_SERVICE'),
    ]),
    JwtModule.register({}),
  ],
  controllers: [AuthController, FreelancerController],
})
export class AuthModule {}
