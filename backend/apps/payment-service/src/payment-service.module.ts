import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentServiceController } from './payment-service.controller';
import { PaymentServiceService } from './payment-service.service';

import { PrismaModule } from './prisma/prisma.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
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
      ],
      uri: process.env.RABBITMQ_URL || RABBITMQ_CONFIG.URI,
      connectionInitOptions: { wait: false },
      defaultPublishOptions: { persistent: true },
    }),
  ],
  controllers: [PaymentServiceController],
  providers: [PaymentServiceService],
})
export class PaymentServiceModule {}
