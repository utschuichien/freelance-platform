import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONFIG } from '@app/shared';


@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
      global: true,
    }),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URL || RABBITMQ_CONFIG.URI,
      connectionInitOptions: { wait: false },
      defaultPublishOptions: { persistent: true },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
