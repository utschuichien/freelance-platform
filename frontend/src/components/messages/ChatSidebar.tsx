import { Search } from "lucide-react";
import { useConversations } from "@/hooks/api/useChat";
import { useChatStore } from "@/store/useChatStore";

import UserAvatar from "@/components/ui/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthStore } from "@/store/useAuthStore";

export default function ChatSidebar() {
  const { data: conversations, isLoading } = useConversations();
  const { activeConversation, setActiveConversation, typingUser } = useChatStore();
  const { user } = useAuthStore();

  const getOtherParticipant = (participants: any[]) => {
    return participants?.find((p: any) => p.userId !== user?.id);
  };

  return (
    <div className={`w-full md:w-80 shrink-0 border-r border-[#222222] bg-[#0A0A0A] flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 border-b border-[#222222]">
        <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="w-full bg-[#161616] text-sm text-white placeholder:text-[#64748B] rounded-xl pl-10 pr-4 py-2.5 outline-none border border-[#222222] focus:border-[#12D18E] transition-colors"
          />
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-[#64748B]">Đang tải...</div>
        ) : conversations?.length === 0 ? (
          <div className="p-4 text-center text-sm text-[#64748B]">Chưa có cuộc trò chuyện nào</div>
        ) : (
          conversations?.map((conv: any) => {
            const other = getOtherParticipant(conv.participants);
            const isActive = activeConversation?.id === conv.id;
            
            return (
              <div 
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${
                  isActive ? 'bg-[#1E1E1E]' : 'hover:bg-[#161616]'
                }`}
              >
                <div className="relative">
                  <UserAvatar seed={other?.userId || "unknown"} className="w-12 h-12" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#12D18E] rounded-full border-2 border-[#0A0A0A]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-white truncate pr-2">User {other?.userId.substring(0,6)}</h4>
                    <span className="text-[10px] text-[#64748B] whitespace-nowrap">
                      {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: vi }) : ''}
                    </span>
                  </div>
                  
                  {typingUser && typingUser.conversationId === conv.id && typingUser.userId !== user?.id ? (
                    <div className="flex items-center gap-1 h-[18px]">
                      <span className="text-xs text-[#12D18E] font-medium italic">Đang gõ</span>
                      <span className="w-1 h-1 bg-[#12D18E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-[#12D18E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-[#12D18E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#94A3B8] truncate h-[18px]">
                      {conv.lastMessage || "Chưa có tin nhắn"}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
