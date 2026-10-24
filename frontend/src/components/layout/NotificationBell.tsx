import { useState, useEffect, useRef } from "react";
import { Bell, Check, Loader2, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { axiosInstance } from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export default function NotificationBell() {
  const router = useRouter();
  const { isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const res = await axiosInstance.get("/notifications");
      return res.data || [];
    },
    staleTime: 2 * 60 * 1000, // Cache notifications for 2 minutes across page transitions
  });

  useEffect(() => {
    const handleNewNotification = (e: any) => {
      queryClient.setQueryData(queryKeys.notifications.all, (old: any[] = []) => [e.detail, ...old]);
    };

    window.addEventListener("notification:new", handleNewNotification);
    return () => {
      window.removeEventListener("notification:new", handleNewNotification);
    };
  }, [queryClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      queryClient.setQueryData(queryKeys.notifications.all, (old: any[] = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await axiosInstance.patch("/notifications/read-all");
      queryClient.setQueryData(queryKeys.notifications.all, (old: any[] = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      await handleMarkAsRead(n.id);
    }
    if (n.link) {
      router.push(n.link);
      setIsOpen(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md bg-[#161616] border border-[#222222] text-[#94A3B8] hover:text-white transition-all cursor-pointer"
        aria-label="Thông báo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#12D18E] text-[9px] font-bold text-[#0C0C0C]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#161616] border border-[#222222] rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#222222]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Thông báo {isConnected && <span className="w-2 h-2 rounded-full bg-green-500" title="Đã kết nối realtime"></span>}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="text-xs text-[#12D18E] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isMarkingAll ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto divide-y divide-[#222222]/50">
            {isLoading ? (
              <div className="flex justify-center p-6 text-[#64748B]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                Bạn không có thông báo nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 hover:bg-[#1C1C1C] transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-[#12D18E]/5' : ''}`}
                >
                  <div className="mt-1">
                    <div className={`w-2 h-2 rounded-full ${!n.isRead ? 'bg-[#12D18E]' : 'bg-transparent'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? 'text-white font-bold' : 'text-[#94A3B8]'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                      {n.content}
                    </p>
                    <p className="text-[10px] text-[#475569] mt-2 font-mono">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="text-[#64748B] hover:text-[#12D18E] transition-colors self-start p-1"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
