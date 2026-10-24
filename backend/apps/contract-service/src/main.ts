import { NestFactory } from '@nestjs/core';
import { ContractServiceModule } from './contract-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ContractServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3005,
      },
    },
  );
  await app.listen();
  console.log('Contract Service is listening on TCP 3005');
}
bootstrap();
