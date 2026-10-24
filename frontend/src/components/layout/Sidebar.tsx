"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import SidebarSkeleton from "./SidebarSkeleton";
import {
  LayoutGrid,
  Briefcase,
  FolderKanban,
  Wallet,
  Search,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  X
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  useEffect(() => setMounted(true), []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-64 bg-[#111111]/80 backdrop-blur-xl border-r border-white/5 flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-300 z-50 ${isMobileMenuOpen ? "fixed inset-y-0 left-0 flex shadow-2xl" : "hidden lg:flex"}`}>
        <div className="p-5 space-y-6">

          {/* Brand Logo & Close Button */}
          <div className="flex items-center justify-between px-2">
            <Link href="/" tabIndex={-1} className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={closeMobileMenu}>
              <div className="w-8 h-8 rounded-full bg-[#12D18E] flex items-center justify-center text-black font-black text-lg glow-mint-sm shadow-[0_0_10px_rgba(18,209,142,0.5)]">
                F
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Freelance<span className="text-[#94A3B8] font-normal">X</span>
              </span>
            </Link>
            <button 
              onClick={closeMobileMenu}
              className="lg:hidden p-1.5 text-[#94A3B8] hover:text-white rounded-md hover:bg-[#1E1E1E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Navigation Groups */}
        <div className="space-y-6 text-xs font-semibold text-[#64748B]">
          {!mounted ? (
            <SidebarSkeleton />
          ) : (
            <>
              {/* MAIN Section */}
              <div className="space-y-2">
                <span className="uppercase tracking-wider text-[10px] font-bold px-2 block text-[#475569]">
                  {user ? 'QUẢN LÝ' : 'KHÁM PHÁ'}
                </span>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition-all ${pathname === "/"
                      ? "bg-[#12D18E] text-[#0C0C0C]"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" /> {user ? 'Tổng quan' : 'Giới thiệu'}
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/projects"
                      onClick={closeMobileMenu}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition-all ${pathname?.startsWith("/projects")
                          ? "bg-[#12D18E] text-[#0C0C0C]"
                          : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
                        }`}
                    >
                      <Briefcase className="w-4 h-4" /> Dự án
                    </Link>
                    <Link
                      href="/contracts"
                      onClick={closeMobileMenu}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition-all ${pathname?.startsWith("/contracts")
                          ? "bg-[#12D18E] text-[#0C0C0C]"
                          : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
                        }`}
                    >
                      <FolderKanban className="w-4 h-4" /> Hợp đồng
                    </Link>
                    <Link
                      href="/wallet"
                      onClick={closeMobileMenu}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition-all ${pathname?.startsWith("/wallet")
                          ? "bg-[#12D18E] text-[#0C0C0C]"
                          : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
                        }`}
                    >
                      <Wallet className="w-4 h-4" /> Ví Escrow
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/jobs" 
                      onClick={closeMobileMenu}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition-all ${pathname?.startsWith("/jobs")
                          ? "bg-[#12D18E] text-[#0C0C0C]"
                          : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
                        }`}
                    >
                      <Search className="w-4 h-4" /> Tìm việc
                    </Link>
                    <Link 
                      href="/freelancers" 
                      onClick={closeMobileMenu}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-bold transition-all ${pathname?.startsWith("/freelancers")
                          ? "bg-[#12D18E] text-[#0C0C0C]"
                          : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
                        }`}
                    >
                      <Users className="w-4 h-4" /> Freelancers
                    </Link>
                  </>
                )}
              </div>

              {/* Conditional Sections */}
              {user ? (
                <div className="space-y-1">
                  <span className="uppercase tracking-wider text-[10px] font-bold px-2 block text-[#475569] mb-2">KHÁM PHÁ</span>
                  <Link href="/jobs" onClick={closeMobileMenu} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-bold transition-all ${pathname?.startsWith("/jobs") ? "bg-[#12D18E] text-[#0C0C0C]" : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"}`}>
                    <Search className="w-4 h-4" /> Tìm việc
                  </Link>
                  <Link href="/freelancers" onClick={closeMobileMenu} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-bold transition-all ${pathname?.startsWith("/freelancers") ? "bg-[#12D18E] text-[#0C0C0C]" : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"}`}>
                    <Users className="w-4 h-4" /> Freelancers
                  </Link>
                  <Link href="/messages" onClick={closeMobileMenu} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-bold transition-all ${pathname?.startsWith("/messages") ? "bg-[#12D18E] text-[#0C0C0C]" : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"}`}>
                    <MessageSquare className="w-4 h-4" /> Tin nhắn
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 mt-6">
                  <span className="uppercase tracking-wider text-[10px] font-bold px-2 block text-[#475569] mb-2">CẦN ĐĂNG NHẬP</span>
                  <div className="w-full flex items-center justify-between px-3 py-2 rounded-md font-semibold text-[#475569] cursor-not-allowed">
                    <div className="flex items-center gap-3"><Briefcase className="w-4 h-4" /> Dự án</div>
                  </div>
                  <div className="w-full flex items-center justify-between px-3 py-2 rounded-md font-semibold text-[#475569] cursor-not-allowed">
                    <div className="flex items-center gap-3"><FolderKanban className="w-4 h-4" /> Hợp đồng</div>
                  </div>
                  <div className="w-full flex items-center justify-between px-3 py-2 rounded-md font-semibold text-[#475569] cursor-not-allowed">
                    <div className="flex items-center gap-3"><Wallet className="w-4 h-4" /> Ví Escrow</div>
                  </div>

                  <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#111111] border border-[#12D18E]/20">
                    <h6 className="text-[#12D18E] font-bold mb-1">Mở khóa tính năng</h6>
                    <p className="text-[10px] text-[#94A3B8] mb-3 leading-relaxed">Tạo tài khoản miễn phí để quản lý dự án và giao dịch an toàn với Escrow.</p>
                    <Link href="/register" onClick={closeMobileMenu} className="block w-full py-2 bg-[#12D18E] text-black text-center font-bold rounded-lg hover:bg-[#0EAE75] transition-all duration-300">Đăng ký</Link>
                  </div>
                </div>
              )}
              {/* SYSTEM Section */}
              <div className="space-y-1">
                <span className="uppercase tracking-wider text-[10px] font-bold px-2 block text-[#475569] mb-2">HỆ THỐNG</span>
                <Link
                  href="/help"
                  onClick={closeMobileMenu}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-bold transition-all ${pathname?.startsWith("/help")
                      ? "bg-[#12D18E] text-[#0C0C0C]"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
                    }`}
                >
                  <HelpCircle className="w-4 h-4" /> Trợ giúp
                </Link>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 text-[11px] text-[#64748B] flex items-center justify-between">
        <span>FreelanceX v1.0</span>
        <span className="w-2 h-2 rounded-full bg-[#12D18E] animate-pulse"></span>
      </div>
    </aside>
    </>
  );
}
