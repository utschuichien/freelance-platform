import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/notification/index.js';
import { createMariaDbAdapter } from '@app/shared';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = createMariaDbAdapter({
      database: 'notification_db',
      envUrlKey: 'NOTIFICATION_DATABASE_URL',
    });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
