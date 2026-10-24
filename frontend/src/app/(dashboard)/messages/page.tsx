"use client";

import { useEffect } from "react";
import ChatSidebar from "@/components/messages/ChatSidebar";
import ChatWindow from "@/components/messages/ChatWindow";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { connectSocket, disconnectSocket, activeConversation } = useChatStore();

  useEffect(() => {
    if (user) {
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user, connectSocket, disconnectSocket]);

  return (
    <main className="max-w-[1400px] w-full mx-auto p-2 sm:p-4 md:py-6 h-[calc(100vh-64px)] overflow-hidden">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden h-full flex shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <ChatSidebar />
        <ChatWindow />
      </div>
    </main>
  );
}
