'use client';

import {
    ArrowLeft,
    Clock,
    Users,
    ShieldCheck,
    CheckCircle2,
    Bookmark,
    Share2,
    Flag,
    Lock,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuthStore } from '@/store/useAuthStore';
import { useGetProject, useSubmitProposal, useAcceptProposal } from '@/hooks/api/useProjects';
import { useParams } from 'next/dist/client/components/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const proposalSchema = z.object({
    bidAmount: z.number({ invalid_type_error: 'Vui lòng nhập thông tin' })
        .min(100000, 'Mức giá tối thiểu là 100.000 ₫'),
    estimatedDays: z.number({ invalid_type_error: 'Vui lòng nhập thông tin' })
        .min(1, 'Thời gian hoàn thành ít nhất 1 ngày')
        .max(365, 'Thời gian tối đa 365 ngày'),
    coverLetter: z.string()
        .min(50, 'Lời nhắn cần ít nhất 50 ký tự để thuyết phục khách hàng')
        .max(2000, 'Lời nhắn không vượt quá 2000 ký tự'),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function JobDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { isAuthenticated, user } = useAuthStore();
    const { data: job, isLoading } = useGetProject(id);
    const submitProposalMutation = useSubmitProposal(id);
    const acceptProposalMutation = useAcceptProposal(id);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema),
    });

    const onSubmit = (data: ProposalFormValues) => {
        submitProposalMutation.mutate(
            data,
            {
                onSuccess: () => {
                    toast.success('Đã gửi báo giá thành công!');
                    reset();
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi báo giá.');
                },
            },
        );
    };

    const handleAcceptProposal = (proposalId: string) => {
        if (
            confirm(
                'Bạn có chắc chắn muốn duyệt báo giá này? Trạng thái dự án sẽ chuyển sang Đang thực hiện.',
            )
        ) {
            acceptProposalMutation.mutate(proposalId, {
                onSuccess: () => {
                    toast.success('Đã duyệt báo giá thành công!');
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt báo giá.');
                },
            });
        }
    };

    if (isLoading) {
        return (
            <main className="p-6 flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#12D18E] animate-spin" />
            </main>
        );
    }

    if (!job) {
        return (
            <main className="p-6 flex-1 flex items-center justify-center text-[#94A3B8]">
                Không tìm thấy dự án hoặc dự án đã bị xóa.
            </main>
        );
    }

    return (
        <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/jobs"
                    className="inline-flex items-center text-xs sm:text-sm text-[#94A3B8] hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Chợ Việc Làm
                </Link>
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#94A3B8] hover:text-white hover:bg-[#161616] transition-all p-2 sm:px-3"
                    >
                        <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#94A3B8] hover:text-white hover:bg-[#161616] transition-all p-2 sm:px-3"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#94A3B8] hover:text-red-400 hover:bg-red-400/10 transition-all p-2 sm:px-3"
                    >
                        <Flag className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Job Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111111] border-none p-4 sm:p-6 md:p-8 rounded-2xl space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden">
                        {/* Accent gradient top */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#12D18E]/50 to-transparent"></div>
                        
                        <div className="space-y-4 border-b border-[#222222]/80 pb-6">
                            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-white to-[#94A3B8] bg-clip-text text-transparent tracking-tight leading-tight">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> Đăng{' '}
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" /> {job._count?.proposals || 0} Báo
                                    giá
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 border-b border-[#222222]/50 pb-6">
                            <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                Mô tả công việc
                            </h3>
                            <p className="text-[13px] text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                Kỹ năng yêu cầu
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills?.map((s: any, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-1.5 rounded-full bg-[#12D18E]/10 border border-[#12D18E]/20 text-[12px] text-[#12D18E] font-bold tracking-wide"
                                    >
                                        {s.skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Proposals List (Only visible to project owner) */}
                        {job.proposals && (
                            <div className="space-y-4 pt-6 border-t border-[#222222]/50">
                                <h3 className="text-[13px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
                                    Danh sách báo giá ({job.proposals.length})
                                    {job.status === 'IN_PROGRESS' && (
                                        <span className="text-[#12D18E] text-[11px] bg-[#12D18E]/10 px-3 py-1 rounded-full">
                                            Đã duyệt 1 báo giá
                                        </span>
                                    )}
                                </h3>

                                {job.proposals.length === 0 ? (
                                    <p className="text-[13px] text-[#94A3B8]">
                                        Chưa có báo giá nào.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {job.proposals.map((p: any) => (
                                            <div
                                                key={p.id}
                                                className={`p-4 rounded-xl border ${p.status === 'ACCEPTED' ? 'bg-[#12D18E]/5 border-[#12D18E]/20' : 'bg-[#161616] border-[#222222]'} space-y-3`}
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <Link href={`/freelancers/${p.freelancerId}`}>
                                                            <UserAvatar 
                                                                seed={p.freelancer?.fullName || p.freelancerId} 
                                                                src={p.freelancer?.avatarUrl} 
                                                                className="w-10 h-10 border-[#12D18E]/30 hover:scale-105 transition-transform" 
                                                            />
                                                        </Link>
                                                        <div>
                                                            <Link href={`/freelancers/${p.freelancerId}`} className="text-[13px] font-bold text-white hover:text-[#12D18E] transition-colors block">
                                                                {p.freelancer?.fullName || `Freelancer #${p.freelancerId.substring(0, 6)}`}
                                                            </Link>
                                                            <p className="text-[11px] font-mono text-[#64748B]">
                                                                ID: {p.freelancerId.substring(0, 8)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right pl-13 sm:pl-0">
                                                        <p className="text-[15px] font-black text-white">
                                                            {Number(p.bidAmount).toLocaleString(
                                                                'vi-VN',
                                                            )}{' '}
                                                            ₫
                                                        </p>
                                                        <p className="text-[11px] text-[#94A3B8]">
                                                            {p.estimatedDays} ngày
                                                        </p>
                                                    </div>
                                                </div>
                                                {p.coverLetter && (
                                                    <div className="p-3 bg-[#111111] rounded-lg text-[13px] text-[#94A3B8]">
                                                        {p.coverLetter}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-2">
                                                    <span
                                                        className={`text-[11px] font-bold px-3 py-1 rounded-full ${p.status === 'ACCEPTED'
                                                                ? 'bg-[#12D18E]/10 text-[#12D18E]'
                                                                : p.status === 'REJECTED'
                                                                    ? 'bg-red-500/10 text-red-500'
                                                                    : 'bg-[#222222] text-[#94A3B8]'
                                                            }`}
                                                    >
                                                        {p.status === 'ACCEPTED'
                                                            ? 'Đã duyệt'
                                                            : p.status === 'REJECTED'
                                                                ? 'Bị từ chối'
                                                                : 'Chờ duyệt'}
                                                    </span>

                                                    {job.status === 'OPEN' &&
                                                        p.status === 'PENDING' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleAcceptProposal(p.id)
                                                                }
                                                                disabled={
                                                                    acceptProposalMutation.isPending
                                                                }
                                                                className="bg-[#12D18E] text-black hover:bg-[#0EAE75] text-[11px] font-bold h-8"
                                                            >
                                                                {acceptProposalMutation.isPending
                                                                    ? 'Đang xử lý...'
                                                                    : 'Duyệt'}
                                                            </Button>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Bid Action & Client Info */}
                <div className="space-y-6">
                    {/* Bid Card */}
                    <div className="bg-[#111111] border-none p-5 sm:p-6 md:p-8 rounded-2xl space-y-5 sm:space-y-6 shadow-[0_0_40px_rgba(18,209,142,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#12D18E]/10 blur-[50px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>
                        <div className="space-y-1 relative z-10">
                            <span className="text-[12px] font-bold text-[#12D18E] uppercase tracking-wider">
                                Ngân sách dự kiến
                            </span>
                            <h2 className="text-3xl font-black text-white flex items-center gap-1 drop-shadow-md">
                                {Number(job.budget).toLocaleString('vi-VN')} ₫
                            </h2>
                        </div>

                        <div className="relative space-y-4">
                            {/* Overlay for unauthenticated or non-freelancer users */}
                            {!isAuthenticated ? (
                                <div className="absolute inset-[-24px] z-10 bg-[#0C0C0C]/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                                    <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex flex-col items-center w-full max-w-[280px] shadow-2xl">
                                        <Lock className="w-8 h-8 text-[#12D18E] mb-4" />
                                        <p className="text-[13px] text-white font-bold mb-4 text-center">
                                            Đăng nhập để gửi báo giá
                                        </p>
                                        <Link
                                            href="/login"
                                            className="px-6 py-2.5 w-full text-center bg-[#12D18E] text-[#0C0C0C] font-bold text-[13px] rounded-full hover:bg-[#0EAE75] transition-all"
                                        >
                                            Đăng nhập ngay
                                        </Link>
                                    </div>
                                </div>
                            ) : user?.id === job.clientId ? (
                                <div className="absolute inset-[-24px] z-10 bg-[#0C0C0C]/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                                    <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex flex-col items-center w-full max-w-[320px] shadow-2xl">
                                        <ShieldCheck className="w-8 h-8 text-[#12D18E] mb-4" />
                                        <p className="text-[13px] text-white font-bold mb-2 text-center">
                                            Đây là dự án của bạn
                                        </p>
                                        <p className="text-[11px] text-[#94A3B8] text-center">
                                            Hãy xem danh sách báo giá của các Freelancer ở cột bên
                                            trái.
                                        </p>
                                    </div>
                                </div>
                            ) : user?.role !== 'FREELANCER' ? (
                                <div className="absolute inset-[-24px] z-10 bg-[#0C0C0C]/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                                    <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex flex-col items-center w-full max-w-[320px] shadow-2xl">
                                        <ShieldCheck className="w-8 h-8 text-amber-500 mb-4" />
                                        <p className="text-[13px] text-white font-bold mb-2 text-center">
                                            Chỉ dành cho Freelancer
                                        </p>
                                        <p className="text-[11px] text-[#94A3B8] text-center">
                                            Bạn đang đăng nhập bằng tài khoản Khách hàng (Client).
                                            Vui lòng sử dụng tài khoản Freelancer để báo giá.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                                        Mức giá bạn đề xuất (VNĐ)
                                    </label>
                                    <input
                                        type="number"
                                        {...register('bidAmount', { valueAsNumber: true })}
                                        placeholder="Ví dụ: 50000000"
                                        className={`w-full p-3.5 rounded-xl bg-[#161616] border-0 focus:ring-0 focus:outline-none outline-none text-[13px] font-bold placeholder-[#333333] transition-all ${errors.bidAmount ? 'ring-1 ring-red-500/50' : ''}`}
                                    />
                                    {errors.bidAmount && (
                                        <p className="text-red-400 text-[11px] mt-1">{errors.bidAmount.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                                        Thời gian hoàn thành dự kiến
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            {...register('estimatedDays', { valueAsNumber: true })}
                                            placeholder="Ví dụ: 14"
                                            className={`w-full p-3.5 pr-16 rounded-xl bg-[#161616] border-0 focus:ring-0 focus:outline-none outline-none text-[13px] font-bold placeholder-[#333333] transition-all ${errors.estimatedDays ? 'ring-1 ring-red-500/50' : ''}`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#64748B]">
                                            ngày
                                        </span>
                                    </div>
                                    {errors.estimatedDays && (
                                        <p className="text-red-400 text-[11px] mt-1">{errors.estimatedDays.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                                        Lời nhắn tới khách hàng
                                    </label>
                                    <textarea
                                        rows={4}
                                        {...register('coverLetter')}
                                        placeholder="Giải thích chi tiết về kinh nghiệm và cách bạn sẽ thực hiện dự án này..."
                                        className={`w-full p-3.5 rounded-xl bg-[#161616] border-0 focus:ring-0 focus:outline-none outline-none text-[13px] placeholder-[#333333] resize-none transition-all ${errors.coverLetter ? 'ring-1 ring-red-500/50' : ''}`}
                                    ></textarea>
                                    {errors.coverLetter && (
                                        <p className="text-red-400 text-[11px] mt-1">{errors.coverLetter.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitProposalMutation.isPending || job.status !== 'OPEN'}
                                    className="w-full h-12 rounded-xl bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] text-[13px] font-black transition-all disabled:opacity-50 mt-4"
                                >
                                    {submitProposalMutation.isPending
                                        ? 'Đang gửi...'
                                        : job.status === 'OPEN'
                                            ? 'Gửi Báo Giá'
                                            : 'Đã đóng'}
                                </Button>
                            </form>
                        </div>

                        <p className="text-[11px] text-[#64748B] text-center">
                            100% khoản thanh toán sẽ được bảo vệ bởi Escrow Smart Contract.
                        </p>
                    </div>

                    {/* Client Info */}
                    <div className="bg-gradient-to-b from-[#161616] to-[#111111] p-5 sm:p-6 md:p-8 rounded-2xl border-none space-y-5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                        
                        <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#222222]/50 pb-3 relative z-10">
                            Thông tin Khách hàng
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <UserAvatar 
                                    seed={job.client?.fullName || 'Client'} 
                                    src={job.client?.avatarUrl} 
                                    className="w-11 h-11 border-white/10" 
                                />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-bold text-white text-[13px]">
                                            {job.client?.fullName || 'Khách hàng ẩn danh'}
                                        </h4>
                                        {job.client && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[#64748B]">Khách hàng đối tác</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-[12px] text-[#94A3B8]">
                                <div className="flex justify-between items-center">
                                    <span>Đánh giá:</span>
                                    <span className="text-amber-400 font-bold">Chưa có (Beta)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Vị trí:</span>
                                    <span className="text-white">Toàn cầu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
