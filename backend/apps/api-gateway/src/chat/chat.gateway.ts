import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CHAT_PATTERNS } from '@app/shared';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    @Inject('CHAT_SERVICE') private chatClient: ClientProxy,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;
      let token = null as string | null;
      if (cookies) {
        const tokenMatch = cookies.match(/accessToken=([^;]+)/);
        if (tokenMatch) {
          token = tokenMatch[1] as string;
        }
      }

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.userId;
      // Join a room unique to the user to receive targeted messages
      client.join(`chat_user_${userId}`);
      
      // Store userId in socket object for later use
      client.data.userId = userId;

      console.log(`[Chat] User ${userId} connected`);
    } catch (err) {
      console.error('[Chat] Socket auth failed:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[Chat] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    try {
      // 1. Save to Chat Service via RPC
      const savedMessage = await firstValueFrom(
        this.chatClient.send(CHAT_PATTERNS.SEND_MESSAGE, {
          conversationId: data.conversationId,
          senderId,
          content: data.content,
        })
      );

      // 2. Broadcast to receiver
      this.server.to(`chat_user_${data.receiverId}`).emit('receive_message', savedMessage);
      
      // 3. Return to sender so they can update their UI instantly
      return savedMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { receiverId: string; conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    this.server.to(`chat_user_${data.receiverId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userId: senderId
    });
  }
}
