'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            if (!isAuthenticated) {
                router.push(`/login?redirect=${pathname}`);
            } else if (user?.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [isAuthenticated, user, router, pathname, isMounted]);
    if (!isMounted || !isAuthenticated || user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen text-[#1D1D1F] font-sans font-normal relative bg-[#F5F5F7] selection:bg-[#0071E3]/20 selection:text-[#0071E3]">
            <AdminSidebar />
            <div className="lg:pl-56 flex flex-col min-h-screen">
                <AdminHeader />
                <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
            </div>
        </div>
    );
}
