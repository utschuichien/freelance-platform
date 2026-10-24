import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
    isRead: boolean;
}

interface ChatState {
    socket: Socket | null;
    activeConversation: any | null;
    messages: Message[];
    typingUser: { conversationId: string; userId: string; timestamp: number } | null;

    connectSocket: () => void;
    disconnectSocket: () => void;
    setActiveConversation: (convo: any) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    sendMessage: (content: string, receiverId: string) => void;
    sendTyping: (receiverId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    activeConversation: null,
    messages: [],
    typingUser: null,

    connectSocket: () => {
        const existingSocket = get().socket;
        if (existingSocket?.connected) return;
        const socketUrl = 
            process.env.NEXT_PUBLIC_SOCKET_URL || 
            process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 
            'http://localhost:3000';
        const newSocket = io(`${socketUrl}/chat`, {
            withCredentials: true,
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected to /chat namespace');
        });

        newSocket.on('receive_message', (message: Message) => {
            const state = get();
            if (state.activeConversation?.id === message.conversationId) {
                state.addMessage(message);
                // Xóa trạng thái đang gõ ngay khi có tin nhắn mới
                set({ typingUser: null });
            }
        });

        newSocket.on('user_typing', (data: { conversationId: string; userId: string }) => {
            set({ typingUser: { ...data, timestamp: Date.now() } });
            
            // Tự động clear sau 3 giây
            setTimeout(() => {
                const current = get().typingUser;
                if (current?.timestamp && Date.now() - current.timestamp >= 2900) {
                    set({ typingUser: null });
                }
            }, 3000);
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
            set({ socket: null, activeConversation: null, messages: [] });
        }
    },

    setActiveConversation: (convo) => {
        set({ activeConversation: convo });
    },

    setMessages: (messages) => {
        set({ messages });
    },

    addMessage: (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
    },

    sendMessage: (content, receiverId) => {
        const { socket, activeConversation } = get();
        if (!socket || !activeConversation) return;

        socket.emit(
            'send_message',
            {
                conversationId: activeConversation.id,
                receiverId,
                content,
            },
            (savedMessage: Message) => {
                // Callback from server when message is saved
                if (savedMessage && savedMessage.id) {
                    get().addMessage(savedMessage);
                }
            },
        );
    },

    sendTyping: (receiverId) => {
        const { socket, activeConversation } = get();
        if (!socket || !activeConversation) return;

        socket.emit('typing', {
            conversationId: activeConversation.id,
            receiverId,
        });
    },
}));
