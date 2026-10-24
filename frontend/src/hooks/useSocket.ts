import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      'http://localhost:3000';

    const socket = io(socketUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setIsConnected(false);
    });

    socket.on('notification:new', (data) => {
      toast.info(data.title, {
        description: data.content,
      });
      // You can dispatch a global event or update a store here
      window.dispatchEvent(new CustomEvent('notification:new', { detail: data }));
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated]);

  return { socket: socketRef.current, isConnected };
};
