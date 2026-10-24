import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ChatServiceService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: true,
          }
        }
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc'
        }
      }
    });

    return participants.map(p => p.conversation);
  }

  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createOrGetDirectConversation(userAId: string, userBId: string) {
    // Tìm hội thoại direct đã tồn tại giữa 2 người
    const existingConvos = await this.prisma.conversationParticipant.findMany({
      where: { userId: userAId },
      include: {
        conversation: {
          include: {
            participants: true,
          }
        }
      }
    });

    for (const p of existingConvos) {
      if (p.conversation.type === 'DIRECT') {
        const hasUserB = p.conversation.participants.some(cp => cp.userId === userBId);
        if (hasUserB) {
          return p.conversation;
        }
      }
    }

    // Nếu chưa có, tạo mới
    const conversation = await this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId: userAId },
            { userId: userBId }
          ]
        }
      },
      include: {
        participants: true
      }
    });

    return conversation;
  }

  async sendMessage(data: { conversationId: string; senderId: string; content: string; type?: any }) {
    const { conversationId, senderId, content, type } = data;

    // Lưu tin nhắn
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type: type || 'TEXT',
      }
    });

    // Cập nhật cuộc hội thoại
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.substring(0, 50),
        lastMessageAt: new Date(),
      }
    });

    return message;
  }

  async markAsRead(conversationId: string, userId: string, messageId: string) {
    return this.prisma.conversationParticipant.update({
      where: {
        uq_conv_user: {
          conversationId,
          userId
        }
      },
      data: {
        lastReadMessageId: messageId
      }
    });
  }
}
