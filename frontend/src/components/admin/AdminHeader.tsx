"use client";

import { Search, Bell, Menu, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useUIStore } from "@/store/useUIStore";
import UserAvatar from "@/components/ui/UserAvatar";

export default function AdminHeader() {
  const { user } = useAuthStore();
  const { setAdminMobileMenuOpen } = useUIStore();
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="h-16 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-6 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setAdminMobileMenuOpen(true)}
          className="lg:hidden text-slate-500 hover:text-slate-800 -ml-2 p-2 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="w-[18px] h-[18px] text-[#86868B] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-72 pl-10 pr-4 py-2 bg-white/60 border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full text-[14px] outline-none focus:bg-white focus:border-[#0071E3]/30 transition-all text-[#1D1D1F] placeholder-[#86868B] font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 rounded-full bg-white/60 text-[#515154] hover:text-[#1D1D1F] border border-black/5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/60 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-full p-1 pr-3 cursor-pointer hover:bg-white transition-all">
            <UserAvatar seed={user?.fullName || "Admin"} className="w-7 h-7 shadow-sm" />
            <div className="hidden md:block">
              <p className="font-semibold text-[#1D1D1F] text-[13px] leading-tight">{user?.fullName || 'Super Admin'}</p>
              <p className="text-[11px] text-[#86868B] font-medium">{user?.role || 'Admin'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 cursor-pointer bg-black/5 text-[#515154] hover:bg-[#FF3B30] hover:text-white rounded-[14px] transition-all flex items-center justify-center"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
