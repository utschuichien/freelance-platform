"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import CreateProjectModal from "../dashboard/CreateProjectModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, logoutUser } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const publicRoutes = ['/jobs', '/freelancers', '/help'];
  const isPublicPage = pathname === '/' || publicRoutes.some(route => pathname === route || pathname?.startsWith(`${route}/`));

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated && !isPublicPage) {
        router.push(`/login?redirect=${pathname}`);
      }
    }
  }, [isAuthenticated, router, pathname, isMounted, isPublicPage]);

  // Prevent hydration mismatch and hide content from unauthorized users
  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated && !isPublicPage) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0C0C0C] text-[#F8FAFC] flex font-sans">

      {/* 1. LEFT SIDEBAR */}
      <Sidebar />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <TopHeader
          setShowCreateProjectModal={setShowCreateProjectModal}
          isLoggedIn={isAuthenticated}
          user={user}
          logoutUser={logoutUser}
        />

        {/* Dynamic Page Content */}
        {children}

      </div>

      {/* GLOBAL MODALS */}
      {showCreateProjectModal && (
        <CreateProjectModal onClose={() => setShowCreateProjectModal(false)} />
      )}

    </div>
  );
}
