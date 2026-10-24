"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  ShieldAlert, 
  Settings,
  LogOut,
  Bell,
  X
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
    { name: "Người dùng & KYC", href: "/admin/users", icon: Users },
    { name: "Rút tiền", href: "/admin/finance", icon: Wallet },
    { name: "Tranh chấp", href: "/admin/disputes", icon: ShieldAlert },
    { name: "Cài đặt", href: "/admin/settings", icon: Settings },
  ];

  const { isAdminMobileMenuOpen, setAdminMobileMenuOpen } = useUIStore();
  const closeMobileMenu = () => setAdminMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isAdminMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`w-56 bg-white/80 backdrop-blur-2xl border-r border-black/5 flex-col justify-between transition-transform duration-300 z-50 fixed inset-y-0 ${isAdminMobileMenuOpen ? "flex shadow-2xl translate-x-0" : "hidden lg:flex"}`}>
        <div className="p-5">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between mb-8 +">
            <Link href="/admin" className="flex items-center gap-2.5" onClick={closeMobileMenu}>
              <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] flex items-center justify-center text-white font-black text-sm shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                X
              </div>
              <span className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">
                Freelance<span className="font-normal text-[#86868B]">Admin</span>
              </span>
            </Link>
            <button 
              onClick={closeMobileMenu}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Nav Links */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[14px] font-medium transition-all ${
                  isActive 
                    ? "bg-[#0071E3] text-white" 
                    : "text-[#515154] hover:bg-black/5 hover:text-[#1D1D1F]"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
    </>
  );
}
