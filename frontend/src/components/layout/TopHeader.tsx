import { useState, useEffect } from "react";
import { Search, Sun, Bell, PlusCircle, Loader2, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useGetWallet } from "@/hooks/api/useWallet";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import UserAvatar from "@/components/ui/UserAvatar";

interface TopHeaderProps {
  setShowCreateProjectModal?: (show: boolean) => void;
  isLoggedIn?: boolean;
  user?: any;
  logoutUser?: () => void;
}

export default function TopHeader({ setShowCreateProjectModal, isLoggedIn = false, user }: TopHeaderProps) {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { setProfileModalOpen, setMobileMenuOpen } = useUIStore();
  const { data: wallet } = useGetWallet(isLoggedIn);

  const availableBalance = wallet ? Number(wallet.availableBalance) : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };
  return (
    <header className="h-16 border-b border-white/5 bg-[#0C0C0C]/60 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden p-2 -ml-1 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Field */}
      <div className="relative w-72 hidden md:block">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Tìm việc làm, dự án..."
          className="w-full pl-10 pr-4 py-2 rounded-md bg-[#161616] border border-[#222222] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#12D18E] transition-all"
        />
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-3 ml-auto md:ml-0">
        <button className="p-2 rounded-md bg-[#161616] border border-[#222222] text-[#94A3B8] hover:text-white transition-all hidden sm:block cursor-pointer">
          <Sun className="w-4 h-4" />
        </button>

        {!mounted ? (
          <div className="w-32 h-9 bg-[#161616] animate-pulse rounded-md"></div>
        ) : isLoggedIn ? (
          <>

            <NotificationBell />
            <button
              onClick={() => setShowCreateProjectModal?.(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-[#12D18E]/50 text-[#12D18E] font-bold text-xs hover:bg-[#12D18E]/10 transition-all duration-300 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Đăng Dự Án
            </button>
            <Link
              href="/wallet"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#161616] border border-[#222222] text-[#94A3B8] font-medium text-xs hover:bg-[#0C0C0C] hover:opacity-70 transition-all cursor-pointer"
            >
              Ví Escrow: <span className="text-[#12D18E]">{formatCurrency(availableBalance)}</span>
            </Link>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2">
              <div
                onClick={() => setProfileModalOpen(true)}
                className="cursor-pointer hover:scale-105 transition-transform"
                title="Hồ sơ cá nhân"
              >
                <UserAvatar seed={user?.fullName || "User"} className="w-8 h-8 sm:w-9 sm:h-9 border-amber-400/50" />
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs text-[#94A3B8] hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                title="Đăng xuất"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 sm:hidden text-[#94A3B8]" />
                )}
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <a href="/login" className="px-5 py-1.5 rounded-md text-sm font-bold bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] transition-all duration-300">
              Đăng nhập
            </a>
          </div>
        )}
      </div>

    </header>
  );
}
