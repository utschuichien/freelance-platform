import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Nack, RabbitSubscribe, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage } from 'amqplib';
import { NotificationServiceService } from './notification-service.service';
import { RABBITMQ_CONFIG, NOTIFICATION_PATTERNS } from '@app/shared';

@Controller()
export class NotificationServiceController {
  private readonly MAX_RETRIES = 3;

  private async executeWithRetry(
    actionName: string,
    targetQueue: string,
    data: any,
    message: ConsumeMessage | undefined,
    executeFn: () => Promise<any>,
  ) {
    try {
      return await executeFn();
    } catch (err: any) {
      const currentRetry = (message?.properties?.headers?.['x-retry-count'] || 0) as number;

      if (currentRetry < this.MAX_RETRIES) {
        const nextRetry = currentRetry + 1;
        console.warn(
          `[Retry ${nextRetry}/${this.MAX_RETRIES}] ${actionName} thất bại, chuyển vào Retry Queue (chờ 5s)... Lỗi: ${err?.message || err}`,
        );
        await this.amqpConnection.publish(
          RABBITMQ_CONFIG.EXCHANGES.RETRY_EXCHANGE,
          targetQueue,
          data,
          {
            headers: {
              ...(message?.properties?.headers || {}),
              'x-retry-count': nextRetry,
              'x-original-routing-key': message?.fields?.routingKey,
            },
          },
        );

        return;
      }

      console.error(
        `[DLQ] ${actionName} đã thử ${this.MAX_RETRIES} lần nhưng vẫn lỗi! Chuyển vào Dead Letter Queue. Lỗi:`,
        err?.message || err,
      );
      return new Nack(false);
    }
  }

  constructor(
    private readonly notificationService: NotificationServiceService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
    routingKey: RABBITMQ_CONFIG.ROUTING_KEYS.NOTIFICATION_ALL,
    queue: RABBITMQ_CONFIG.QUEUES.NOTIFICATION_QUEUE,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange':
          RABBITMQ_CONFIG.EXCHANGES.DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key':
          RABBITMQ_CONFIG.ROUTING_KEYS.DEAD_LETTER_NOTIFICATION,
      },
    },
  })
  async createNotification(
    data: {
      userId: string;
      title: string;
      content: string;
      type: string;
      link?: string;
      relatedEntityId?: string;
    },
    message?: ConsumeMessage,
  ) {
    // Bỏ qua các sự kiện không phải in-app notification (ví dụ: notification.email.send_otp)
    if (!data || !data.userId || !data.title || !data.content) {
      return;
    }

    return this.executeWithRetry(
      'Tạo Thông Báo',
      RABBITMQ_CONFIG.QUEUES.NOTIFICATION_QUEUE,
      data,
      message,
      () => this.notificationService.createNotification(data),
    );
  }

  @RabbitSubscribe({
    exchange: RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
    routingKey: RABBITMQ_CONFIG.ROUTING_KEYS.SEND_OTP_EMAIL,
    queue: RABBITMQ_CONFIG.QUEUES.OTP_EMAIL_QUEUE,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange':
          RABBITMQ_CONFIG.EXCHANGES.DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key':
          RABBITMQ_CONFIG.ROUTING_KEYS.DEAD_LETTER_OTP,
      },
    },
  })
  async sendOtpEmail(
    data: { email: string; code: string; fullName: string },
    message?: ConsumeMessage,
  ) {
    return this.executeWithRetry(
      'Gửi OTP Email',
      RABBITMQ_CONFIG.QUEUES.OTP_EMAIL_QUEUE,
      data,
      message,
      () =>
        this.notificationService.sendOtpEmail(
          data.email,
          data.code,
          data.fullName,
        ),
    );
  }
  @RabbitSubscribe({
    exchange: RABBITMQ_CONFIG.EXCHANGES.DEAD_LETTER_EXCHANGE,
    queue: RABBITMQ_CONFIG.QUEUES.DEAD_LETTER_QUEUE,
    routingKey: RABBITMQ_CONFIG.ROUTING_KEYS.DEAD_LETTER,
    queueOptions: {
      durable: true,
    },
  })
  async handleDeadLetter(msg: any) {
    console.error('Dead letter received:', msg);
  }
  @MessagePattern(NOTIFICATION_PATTERNS.GET_NOTIFICATIONS)
  async getNotifications(@Payload() data: { userId: string }) {
    return this.notificationService.getUserNotifications(data.userId);
  }

  @MessagePattern(NOTIFICATION_PATTERNS.MARK_NOTIFICATION_READ)
  async markAsRead(@Payload() data: { id: string; userId: string }) {
    return this.notificationService.markAsRead(data.id, data.userId);
  }

  @MessagePattern(NOTIFICATION_PATTERNS.MARK_ALL_NOTIFICATIONS_READ)
  async markAllAsRead(@Payload() data: { userId: string }) {
    return this.notificationService.markAllAsRead(data.userId);
  }
}
