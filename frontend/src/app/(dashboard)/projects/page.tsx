'use client';

import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/projects/ProjectCard';
import Link from 'next/link';
import { useGetProjects } from '@/hooks/api/useProjects';
import { useAuthStore } from '@/store/useAuthStore';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';

export default function MyProjectsPage() {
    const user = useAuthStore((state) => state.user);
    const [activeTab, setActiveTab] = useState(user?.role === 'FREELANCER' ? 'IN_PROGRESS' : 'ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { data, isLoading } = useGetProjects(true);

    const allProjects = data?.pages.flatMap((page) => page.data) || [];
    const mappedProjects = allProjects.map((p) => ({
        id: p.id,
        title: p.title,
        company: p.client?.fullName || 'Khách hàng',
        avatar: p.client?.avatarUrl,
        location: p.client?.location || 'Chưa cập nhật',
        type: ['Freelance'],
        budget: `${Number(p.budget).toLocaleString('vi-VN')} đ`,
        skills: p.skills?.map((s) => s.skill?.name || '').filter(Boolean) || [],
        postedAt: new Date(p.createdAt).toLocaleDateString('vi-VN'),
        verified: true,
        status: p.status,
    }));

    const filteredProjects = mappedProjects.filter((p) => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'OPEN' || activeTab === 'PENDING') return p.status === 'OPEN';
        if (activeTab === 'IN_PROGRESS') return p.status === 'IN_PROGRESS';
        if (activeTab === 'CLOSED') return p.status === 'CLOSED' || p.status === 'CANCELLED';
        if (activeTab === 'COMPLETED') return p.status === 'COMPLETED';
        return true;
    });

    const clientTabs = [
        { id: 'ALL', label: 'Tất cả dự án', count: mappedProjects.length },
        {
            id: 'OPEN',
            label: 'Đang mở',
            count: mappedProjects.filter((p) => p.status === 'OPEN').length,
        },
        {
            id: 'IN_PROGRESS',
            label: 'Đang thực hiện',
            count: mappedProjects.filter((p) => p.status === 'IN_PROGRESS').length,
        },
        {
            id: 'COMPLETED',
            label: 'Đã hoàn thành',
            count: mappedProjects.filter((p) => p.status === 'COMPLETED').length,
        },
    ];

    const inProgressCount = mappedProjects.filter((p) => p.status === 'IN_PROGRESS').length;
    const pendingCount = mappedProjects.filter((p) => p.status === 'OPEN').length;
    const completedCount = mappedProjects.filter((p) => p.status === 'COMPLETED').length;

    const freelancerTabs = [
        { id: 'IN_PROGRESS', label: 'Đang thực hiện', count: inProgressCount },
        { id: 'PENDING', label: 'Chờ kết quả thầu', count: pendingCount },
        { id: 'COMPLETED', label: 'Đã hoàn thành', count: completedCount },
        { id: 'ALL', label: 'Tất cả', count: mappedProjects.length },
    ];

    const currentTabs = user?.role === 'CLIENT' ? clientTabs : freelancerTabs;

    return (
        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">
                        {user?.role === 'CLIENT' ? 'Quản Lý Dự Án' : 'Dự Án Của Tôi'}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                        {user?.role === 'CLIENT'
                            ? 'Quản lý các dự án bạn đã đăng hoặc đang thực hiện.'
                            : 'Theo dõi các dự án bạn đang thực hiện hoặc đã gửi báo giá.'}
                    </p>
                </div>
                {user?.role === 'CLIENT' && (
                    <Button 
                        onClick={() => setShowCreateModal(true)} 
                        className="w-full sm:w-auto bg-[#12D18E] hover:bg-[#0EAE75] text-[#0C0C0C] font-bold text-sm px-4 h-10 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(18,209,142,0.25)]"
                    >
                        <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                        Đăng Dự Án Mới
                    </Button>
                )}
            </div>

            {/* Tabs / Filters */}
            <div className="flex items-center gap-2 border-b border-[#222222] pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {currentTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                                isActive
                                    ? 'bg-[#161616] border border-[#222222] text-white'
                                    : 'border border-transparent text-[#94A3B8] hover:text-white'
                            }`}
                        >
                            {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
                        </button>
                    );
                })}
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center p-12 text-[#94A3B8]">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải danh sách dự
                        án...
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-[#94A3B8] border border-dashed border-[#222222] rounded-2xl">
                        <p className="text-sm mb-4">
                            {user?.role === 'CLIENT'
                                ? 'Không có dự án nào trong mục này.'
                                : 'Bạn chưa có dự án nào trong mục này.'}
                        </p>
                        {user?.role === 'FREELANCER' && (
                            <Link href="/jobs">
                                <Button className="bg-[#12D18E] text-black hover:bg-[#0EAE75]">
                                    Tìm việc ngay
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <Link key={project.id} href={`/jobs/${project.id}`}>
                            <ProjectCard project={project} />
                        </Link>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreateProjectModal onClose={() => setShowCreateModal(false)} />
            )}
        </main>
    );
}
