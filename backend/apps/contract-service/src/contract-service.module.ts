import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractServiceController } from './contract-service.controller';
import { ContractServiceService } from './contract-service.service';

import { ClientsModule } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONFIG, getTcpClient } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([
      getTcpClient('PROJECT_SERVICE'),
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
      defaultPublishOptions: { persistent: true },
    }),
  ],
  controllers: [ContractServiceController],
  providers: [ContractServiceService],
})
export class ContractServiceModule {}
