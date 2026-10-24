import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONFIG } from '@app/shared';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || RABBITMQ_CONFIG.URI],
          queue: RABBITMQ_CONFIG.QUEUES.NOTIFICATION_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_URL || RABBITMQ_CONFIG.URI,
      connectionInitOptions: { wait: false },
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway],
})
export class NotificationModule {}
