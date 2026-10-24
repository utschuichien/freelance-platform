'use client';

import {
    ArrowLeft,
    Star,
    MapPin,
    CheckCircle2,
    MessageSquare,
    Briefcase,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/ui/UserAvatar';
import { useCreateDirectConversation } from '@/hooks/api/useChat';
import { useGetFreelancer } from '@/hooks/api/useFreelancers';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function FreelancerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { mutate: createChat, isPending: isCreatingChat } = useCreateDirectConversation();
    const { data: userData, isLoading } = useGetFreelancer(params.id as string);

    const handleStartChat = () => {
        if (!userData) return;
        const targetId = userData.userId || userData.id;
        if (!targetId) return;
        createChat(targetId, {
            onSuccess: () => {
                router.push('/messages');
            },
            onError: () => {
                router.push('/messages');
            }
        });
    };

    if (isLoading) {
        return (
            <main className="p-6 flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#12D18E] animate-spin" />
            </main>
        );
    }

    if (!userData) {
        return (
            <main className="p-6 flex-1 flex items-center justify-center text-[#94A3B8]">
                Không tìm thấy freelancer này.
            </main>
        );
    }

    // Map data, using fallbacks for fields
    const name = userData.fullName || 'Freelancer';
    const freelancer = {
        id: userData.id || userData.userId,
        name: name,
        title: userData.title || userData.bio || 'Freelancer Chuyên Nghiệp',
        avatar: name.substring(0, 2).toUpperCase(),
        rating: userData.rating || 5.0,
        reviews: userData.totalReviews || 0,
        hourlyRate: userData.hourlyRate || 500000,
        skills: Array.isArray(userData.skills)
            ? userData.skills.map((s) => typeof s === 'string' ? s : s.skill?.name || '').filter(Boolean)
            : ['Chưa cập nhật kỹ năng'],
        location: userData.location || 'Chưa cập nhật vị trí',
        verified: userData.kycStatus === 'VERIFIED',
        bio: userData.bio || 'Thông tin giới thiệu bản thân sẽ được hiển thị tại đây sau khi freelancer cập nhật hồ sơ cá nhân.',
        stats: {
            jobsCompleted: userData.completedJobs || 0,
            totalEarned: '0',
            hoursWorked: 0,
        },
        portfolio: [],
    };

    return (
        <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
            {/* Back Button */}
            <div>
                <Link
                    href="/freelancers"
                    className="inline-flex items-center text-xs sm:text-sm text-[#94A3B8] hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Danh bạ Freelancer
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-4 sm:p-6 rounded-2xl border border-[#222222] space-y-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6 border-b border-[#222222] pb-6">
                            {/* Avatar */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0">
                                <UserAvatar 
                                    seed={freelancer.name} 
                                    src={userData.avatarUrl} 
                                    className="w-full h-full border-[#12D18E] border-2 shadow-[0_0_20px_rgba(18,209,142,0.3)]" 
                                />
                                {freelancer.verified && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#111111] rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-2 flex-1">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                                    {freelancer.name}
                                </h1>
                                <p className="text-sm font-medium text-[#12D18E]">
                                    {freelancer.title}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-2">
                                    <span className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-white font-bold">
                                            {freelancer.rating}
                                        </span>{' '}
                                        ({freelancer.reviews} reviews)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" /> {freelancer.location}
                                    </span>
                                </div>
                            </div>

                            {/* Rate */}
                            <div className="text-left md:text-right">
                                <span className="text-xl sm:text-2xl font-black text-white">
                                    {Number(freelancer.hourlyRate).toLocaleString('vi-VN')} ₫
                                </span>
                                <span className="text-xs sm:text-sm text-[#94A3B8] block">/ giờ</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-b border-[#222222] pb-6">
                            <h3 className="text-sm font-bold text-white">Giới thiệu bản thân</h3>
                            <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
                                {freelancer.bio}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white">Kỹ năng chuyên môn</h3>
                            <div className="flex flex-wrap gap-2">
                                {freelancer.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-md bg-[#161616] border border-[#222222] text-xs text-[#94A3B8] font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">
                            Dự án tiêu biểu (Portfolio)
                        </h3>

                        {freelancer.portfolio.length === 0 ? (
                            <p className="text-sm text-[#94A3B8] italic">
                                Freelancer chưa cập nhật dự án nào.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {freelancer.portfolio.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="p-4 rounded-md bg-[#161616] border border-[#222222] hover:border-[#12D18E]/40 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-full h-32 bg-[#222222] rounded-md mb-3 overflow-hidden">
                                            <div className="w-full h-full bg-gradient-to-br from-[#222222] to-[#111111] group-hover:scale-105 transition-transform duration-500"></div>
                                        </div>
                                        <h4 className="font-bold text-white text-sm">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-[#94A3B8] mt-1">
                                            Vai trò: {item.role}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reviews & Client Feedback Section */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-t border-[#222222] pt-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                Đánh giá từ khách hàng ({freelancer.reviews})
                            </h3>
                            {freelancer.reviews > 0 && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                                    ⭐ {freelancer.rating} / 5.0
                                </span>
                            )}
                        </div>

                        {(!userData.reviews || userData.reviews.length === 0) ? (
                            <div className="p-8 rounded-xl bg-[#161616] border border-[#222222] text-center space-y-2">
                                <Star className="w-8 h-8 text-zinc-600 mx-auto" />
                                <p className="text-sm font-semibold text-white">Chưa có đánh giá nào</p>
                                <p className="text-xs text-[#94A3B8]">
                                    Freelancer này chưa có nhận xét nào từ các hợp đồng hoàn thành trước đó.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {userData.reviews.map((rev: any) => (
                                    <div
                                        key={rev.id}
                                        className="p-5 rounded-xl bg-[#161616] border border-[#222222] hover:border-[#333333] transition-colors space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full shrink-0">
                                                    <UserAvatar seed={rev.reviewerName || 'Khách hàng'} className="w-full h-full" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">
                                                        {rev.reviewerName || 'Khách hàng'}
                                                    </h4>
                                                    <span className="text-[11px] text-[#64748B]">
                                                        {new Date(rev.createdAt).toLocaleDateString('vi-VN', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-3.5 h-3.5 ${
                                                            s <= rev.rating
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-zinc-700'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="text-xs font-bold text-white ml-1">
                                                    {rev.rating}.0
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-[#CBD5E1] bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                                            "{rev.comment || 'Khách hàng hài lòng với kết quả công việc.'}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions & Stats */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="glass-card p-6 rounded-md border border-[#222222] space-y-4">
                        <Button 
                            onClick={handleStartChat}
                            disabled={isCreatingChat}
                            className="w-full h-12 bg-[#12D18E] hover:bg-[#0EAE75] text-[#0C0C0C] font-bold text-sm"
                        >
                            {isCreatingChat ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Mời làm việc / Đặt lịch
                        </Button>
                        <Button
                            onClick={handleStartChat}
                            disabled={isCreatingChat}
                            variant="outline"
                            className="w-full h-12 bg-[#111111] border-[#222222] text-white hover:bg-[#1E1E1E] font-medium"
                        >
                            {isCreatingChat ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#12D18E]" /> : <MessageSquare className="w-4 h-4 mr-2 text-[#12D18E]" />}
                            Gửi tin nhắn
                        </Button>
                    </div>

                    {/* Stats Card */}
                    <div className="glass-card p-6 rounded-md border border-[#222222] space-y-4">
                        <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3">
                            Thống kê hoạt động
                        </h3>

                        <div className="space-y-4 text-sm text-[#94A3B8]">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Dự án hoàn thành
                                </span>
                                <strong className="text-white">
                                    {freelancer.stats.jobsCompleted}
                                </strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Tổng thu nhập
                                </span>
                                <strong className="text-white">
                                    {freelancer.stats.totalEarned} ₫
                                </strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Star className="w-4 h-4" /> Tổng giờ làm
                                </span>
                                <strong className="text-white">
                                    {freelancer.stats.hoursWorked} giờ
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
