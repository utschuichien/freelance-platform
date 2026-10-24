import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatServiceService } from './chat-service.service';
import { CHAT_PATTERNS } from '@app/shared';

@Controller()
export class ChatServiceController {
  constructor(private readonly chatService: ChatServiceService) {}

  @MessagePattern(CHAT_PATTERNS.GET_CONVERSATIONS)
  async getConversations(@Payload() data: { userId: string }) {
    return this.chatService.getConversations(data.userId);
  }

  @MessagePattern(CHAT_PATTERNS.GET_MESSAGES)
  async getMessages(@Payload() data: { conversationId: string }) {
    return this.chatService.getMessages(data.conversationId);
  }

  @MessagePattern(CHAT_PATTERNS.GET_OR_CREATE_DIRECT_CONVERSATION)
  async getOrCreateDirectConversation(@Payload() data: { userAId: string; userBId: string }) {
    return this.chatService.createOrGetDirectConversation(data.userAId, data.userBId);
  }

  @MessagePattern(CHAT_PATTERNS.SEND_MESSAGE)
  async sendMessage(@Payload() data: { conversationId: string; senderId: string; content: string; type?: any }) {
    return this.chatService.sendMessage(data);
  }

  @MessagePattern(CHAT_PATTERNS.MARK_AS_READ)
  async markAsRead(@Payload() data: { conversationId: string; userId: string; messageId: string }) {
    return this.chatService.markAsRead(data.conversationId, data.userId, data.messageId);
  }
}
