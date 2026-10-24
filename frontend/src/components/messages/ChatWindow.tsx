import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useMessages } from "@/hooks/api/useChat";
import UserAvatar from "@/components/ui/UserAvatar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthStore } from "@/store/useAuthStore";

export default function ChatWindow() {
  const { user } = useAuthStore();
  const { activeConversation, setActiveConversation, messages, setMessages, sendMessage, typingUser, sendTyping } = useChatStore();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: initialMessages, isLoading } = useMessages(activeConversation?.id || null);

  // When initial messages load, set them to store
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || !user) return;
    
    // Find receiver
    const receiver = activeConversation.participants.find((p: any) => p.userId !== user.id);
    if (!receiver) return;

    sendMessage(inputText.trim(), receiver.userId);
    setInputText("");
  };

  if (!activeConversation) {
    return (
      <div className="hidden md:flex flex-1 bg-[#111111] flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-[#161616] rounded-full flex items-center justify-center mb-6">
          <Send className="w-8 h-8 text-[#333333]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Chưa chọn cuộc trò chuyện</h3>
        <p className="text-[#64748B] max-w-md">Chọn một liên hệ từ danh sách bên trái để bắt đầu nhắn tin hoặc tạo cuộc trò chuyện mới từ hồ sơ freelancer.</p>
      </div>
    );
  }

  const otherParticipant = activeConversation.participants.find((p: any) => p.userId !== user?.id);

  return (
    <div className={`flex-1 bg-[#111111] flex flex-col relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
      {/* Header */}
      <div className="h-16 sm:h-20 border-b border-[#222222] bg-[#111111] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button 
            onClick={() => setActiveConversation(null)}
            className="md:hidden p-2 -ml-2 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            aria-label="Quay lại danh sách chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <UserAvatar seed={otherParticipant?.userId || "unknown"} className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm sm:text-lg font-bold text-white truncate">User {otherParticipant?.userId.substring(0,6)}</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#12D18E] rounded-full shrink-0"></span>
              <span className="text-xs text-[#12D18E] font-medium">Đang hoạt động</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-4 text-[#64748B] shrink-0">
          <button className="hover:text-white transition-colors p-2 rounded-full hover:bg-[#1E1E1E]"><Phone className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          <button className="hover:text-white transition-colors p-2 rounded-full hover:bg-[#1E1E1E]"><Video className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          <button className="hover:text-white transition-colors p-2 rounded-full hover:bg-[#1E1E1E]"><MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#111111] to-[#0A0A0A]">
        {isLoading ? (
          <div className="text-center text-[#64748B] py-10">Đang tải tin nhắn...</div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === user?.id;
            const showTime = index === 0 || new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 10 * 60000;
            
            return (
              <div key={msg.id} className="flex flex-col">
                {showTime && (
                  <span className="text-[10px] font-medium text-[#64748B] text-center my-4 uppercase tracking-wider">
                    {format(new Date(msg.createdAt), 'HH:mm - dd/MM', { locale: vi })}
                  </span>
                )}
                <div className={`flex gap-3 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <UserAvatar seed={msg.senderId} className="w-8 h-8 flex-shrink-0 mt-auto" />
                  )}
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-[#12D18E] text-black rounded-br-sm' 
                        : 'bg-[#1E1E1E] text-white border border-[#2A2A2A] rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingUser && typingUser.conversationId === activeConversation.id && typingUser.userId !== user?.id && (
          <div className="flex gap-3 max-w-[75%] items-end">
            <UserAvatar seed={typingUser.userId} className="w-8 h-8 flex-shrink-0" />
            <div className="px-4 py-3 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] rounded-bl-sm flex items-center gap-1.5 h-[42px]">
              <div className="w-1.5 h-1.5 bg-[#12D18E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#12D18E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#12D18E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0A0A0A] border-t border-[#222222]">
        <form onSubmit={handleSend} className="flex items-end gap-3 bg-[#161616] p-2 rounded-2xl border border-[#2A2A2A] focus-within:border-[#12D18E] transition-colors">
          <button type="button" className="p-3 text-[#64748B] hover:text-white transition-colors rounded-xl hover:bg-[#222222]">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea 
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              
              // Handle typing emit with throttle (every 2s)
              if (!typingTimeoutRef.current && activeConversation) {
                const receiver = activeConversation.participants.find((p: any) => p.userId !== user?.id);
                if (receiver) sendTyping(receiver.userId);
                
                typingTimeoutRef.current = setTimeout(() => {
                  typingTimeoutRef.current = null;
                }, 2000);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-3 resize-none max-h-32 min-h-[44px] custom-scrollbar"
            rows={1}
          />
          
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className={`p-3 rounded-xl transition-colors ${
              inputText.trim() 
                ? 'bg-[#12D18E] text-black hover:bg-[#0EAE75]' 
                : 'bg-[#222222] text-[#64748B] cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
