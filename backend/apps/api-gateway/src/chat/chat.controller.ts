import { Controller, Get, Post, Body, Inject, UseGuards, Req, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/auth.guard';
import { CHAT_PATTERNS } from '@app/shared';

@Controller('api/chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    @Inject('CHAT_SERVICE') private chatClient: ClientProxy,
  ) {}

  @Get('conversations')
  async getConversations(@Req() req: any) {
    const userId = req.user.userId;
    return await firstValueFrom(
      this.chatClient.send(CHAT_PATTERNS.GET_CONVERSATIONS, { userId })
    );
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return await firstValueFrom(
      this.chatClient.send(CHAT_PATTERNS.GET_MESSAGES, { conversationId })
    );
  }

  @Post('conversations/direct')
  async getOrCreateDirectConversation(
    @Req() req: any,
    @Body() data: { targetUserId: string }
  ) {
    const userId = req.user.userId;
    return await firstValueFrom(
      this.chatClient.send(CHAT_PATTERNS.GET_OR_CREATE_DIRECT_CONVERSATION, {
        userAId: userId,
        userBId: data.targetUserId
      })
    );
  }

  @Post('messages/:id/read')
  async markAsRead(
    @Req() req: any,
    @Param('id') messageId: string,
    @Body() data: { conversationId: string }
  ) {
    const userId = req.user.userId;
    return await firstValueFrom(
      this.chatClient.send(CHAT_PATTERNS.MARK_AS_READ, {
        conversationId: data.conversationId,
        userId,
        messageId
      })
    );
  }
}
