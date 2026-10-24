import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { RABBITMQ_CONFIG } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
          type: 'topic',
        },
        {
          name: RABBITMQ_CONFIG.EXCHANGES.DEAD_LETTER_EXCHANGE,
          type: 'topic',
        },
        {
          name: RABBITMQ_CONFIG.EXCHANGES.RETRY_EXCHANGE,
          type: 'topic',
        },
      ],
      queues: [
        {
          name: RABBITMQ_CONFIG.QUEUES.RETRY_QUEUE,
          exchange: RABBITMQ_CONFIG.EXCHANGES.RETRY_EXCHANGE,
          routingKey: '#',
          options: {
            durable: true,
            arguments: {
              'x-message-ttl': 5000, // Chờ 5 giây trước khi tự động dead-letter về default exchange
              'x-dead-letter-exchange': '', // Đẩy trực tiếp về hàng đợi đích dựa trên routing key của message
            },
          },
        },
      ],
      uri: process.env.RABBITMQ_URL || RABBITMQ_CONFIG.URI,
      connectionInitOptions: { wait: false },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER ,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      } as any,
    }),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
