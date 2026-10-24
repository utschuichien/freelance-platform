import { Controller, Get, Patch, Param, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, JwtUserPayload } from '../auth/current-user.decorator';
import { firstValueFrom } from 'rxjs';
import { NotificationGateway } from './notification.gateway';
import { RABBITMQ_CONFIG, NOTIFICATION_PATTERNS } from '@app/shared';

@Controller('api/notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    private notificationGateway: NotificationGateway,
  ) {}

  @Get()
  async getNotifications(@CurrentUser('userId') userId: string) {
    return await firstValueFrom(
      this.notificationClient.send(NOTIFICATION_PATTERNS.GET_NOTIFICATIONS, { userId })
    );
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    return await firstValueFrom(
      this.notificationClient.send(NOTIFICATION_PATTERNS.MARK_ALL_NOTIFICATIONS_READ, { userId })
    );
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return await firstValueFrom(
      this.notificationClient.send(NOTIFICATION_PATTERNS.MARK_NOTIFICATION_READ, { id, userId })
    );
  }

  @RabbitSubscribe({
    exchange: RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
    routingKey: RABBITMQ_CONFIG.ROUTING_KEYS.NOTIFICATION_ALL,
    queue: RABBITMQ_CONFIG.QUEUES.API_GATEWAY_NOTIFICATION_QUEUE,
    queueOptions: {
      durable: true,
    },
  })
  handleNotificationCreated(data: any) {
    if (data && data.userId && data.title) {
      this.notificationGateway.sendNotificationToUser(data.userId, data);
    }
  }
}
