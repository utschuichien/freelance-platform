import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationServiceService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async createNotification(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
    link?: string;
    relatedEntityId?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) {
      return null;
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async sendOtpEmail(email: string, code: string, fullName: string) {
    try {
      await this.mailerService.sendMail({
        from: process.env.MAIL_FROM || '"Freelance Platform" <noreply@freelance.com>',
        to: email,
        subject: 'Mã xác nhận khôi phục mật khẩu - Freelance Platform',
        text: `Mã xác nhận của bạn là: ${code}. Mã này sẽ hết hạn trong 60 giây.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #00F5A0;">Khôi phục mật khẩu</h2>
            <p>Xin chào ${fullName},</p>
            <p>Bạn đã yêu cầu khôi phục mật khẩu. Dưới đây là mã xác nhận (OTP) gồm 6 chữ số của bạn:</p>
            <h1 style="background: #f4f4f4; padding: 15px; border-radius: 8px; letter-spacing: 5px; text-align: center;">${code}</h1>
            <p>Mã này sẽ hết hạn trong 60 giây. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          </div>
        `,
      });
      console.log(`[NotificationService] OTP email sent successfully to ${email}`);
    } catch (err) {
      console.error(`[NotificationService] Failed to send OTP email to ${email}:`, err);
      throw err
    }
  }
}
