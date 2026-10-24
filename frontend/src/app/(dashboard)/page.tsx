'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, ShieldCheck, Zap, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboard } from '@/hooks/api/useDashboard';

import MetricCards from '@/components/dashboard/MetricCards';
import EscrowChart from '@/components/dashboard/EscrowChart';
import EscrowBackupWidget from '@/components/dashboard/EscrowBackupWidget';
import ActiveProjectsList from '@/components/dashboard/ActiveProjectsList';
import SubmitMilestoneModal from '@/components/dashboard/SubmitMilestoneModal';
import HeroBanner from '@/components/dashboard/HeroBanner';
import { useSubmitMilestone, useApproveMilestone } from '@/hooks/api/useContracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DashboardHome() {
    const user = useAuthStore((state) => state.user);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useDashboard(!!user);
    const submitMilestoneMutation = useSubmitMilestone();
    const approveMilestoneMutation = useApproveMilestone();
    const queryClient = useQueryClient();
    const [activeSubmitModalMilestone, setActiveSubmitModalMilestone] = useState<any>(null);
    // console.log('Dashboard Data:', dashboardData);

    const escrowBalance = dashboardData?.wallet?.escrowBalance ?? 0;
    const availableBalance = dashboardData?.wallet?.availableBalance ?? 0;
    const projects = dashboardData?.projects ?? [];
    const milestones = dashboardData?.milestones ?? [];
    const stats = dashboardData?.stats;

    // Actions (Mock until fully implemented in UI)
    const handleFundEscrow = (mId: string, amt: number) => {
        // TODO: Call API to fund (already handled automatically on create)
    };

    const handleApproveMilestone = async (mId: string, amt: number) => {
        if (!confirm(`Bạn có chắc chắn muốn duyệt và giải ngân ${amt.toLocaleString()} VNĐ cho giai đoạn này?`)) return;

        try {
            await approveMilestoneMutation.mutateAsync(mId);
            toast.success("Đã duyệt sản phẩm và giải ngân thành công!");
            refetchDashboard();
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi duyệt sản phẩm. Vui lòng thử lại.");
        }
    };

    const handleSubmitMilestone = async (data: { notes: string; attachmentUrls: string[] }) => {
        if (!activeSubmitModalMilestone) return;
        try {
            await submitMilestoneMutation.mutateAsync({
                id: activeSubmitModalMilestone.id,
                data
            });
            toast.success("Đã nộp sản phẩm thành công!");
            refetchDashboard();
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.");
        }
    };

    return (
        <main className="p-3 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {/* Welcome Hero Banner Component */}
            <HeroBanner user={user} mounted={mounted} />

            {!mounted || (user && isDashboardLoading) ? (
                <div className="w-full h-64 bg-[#161616] animate-pulse rounded-2xl border border-[#222]"></div>
            ) : user ? (
                <>
                    {/* Grid of 6 Colorful Metric Cards */}
                    <MetricCards escrowBalance={escrowBalance} stats={stats} />

                    {/* Bottom Main 2-Column Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Left Column (2/3 width) */}
                        <div className="lg:col-span-2 space-y-4">
                            <EscrowChart
                                milestones={milestones}
                                handleFundEscrow={handleFundEscrow}
                                setActiveSubmitModalMilestone={setActiveSubmitModalMilestone}
                                handleApproveMilestone={handleApproveMilestone}
                            />
                        </div>

                        {/* Right Column (1/3 width) */}
                        <div className="space-y-4">
                            <EscrowBackupWidget
                                availableBalance={availableBalance}
                                escrowBalance={escrowBalance}
                            />
                            <ActiveProjectsList projects={projects} />
                        </div>
                    </div>

                    <SubmitMilestoneModal
                        isOpen={!!activeSubmitModalMilestone}
                        milestone={activeSubmitModalMilestone}
                        onClose={() => setActiveSubmitModalMilestone(null)}
                        onSubmit={handleSubmitMilestone}
                    />
                </>
            ) : (
                <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* HERO SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-8 md:pt-2 md:px-8">
                        <div className="space-y-4">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-[1.15] tracking-tight">
                                Tiền được giữ an toàn,
                                <br />
                                cho đến khi{' '}
                                <span className="text-[#12D18E] underline decoration-[#0E5C43] decoration-4 underline-offset-8">
                                    việc hoàn thành
                                </span>
                            </h1>
                            <p className="text-sm text-[#9FADA6] leading-relaxed max-w-lg">
                                FreelanceX kết nối doanh nghiệp với freelancer đã xác minh. Mọi
                                khoản thanh toán đi qua ví Escrow trung gian — freelancer chỉ nhận
                                tiền khi khách hàng nghiệm thu.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <a
                                    href="/register"
                                    className="flex items-center justify-center px-6 py-2.5 rounded-full bg-[#12D18E] text-[#06140F] font-bold text-sm hover:-translate-y-0.5 hover:shadow-[0_6px_24px_-4px_rgba(18,209,142,0.45)] transition-all"
                                >
                                    Bắt đầu miễn phí
                                </a>
                                <a
                                    href="#how"
                                    className="flex items-center justify-center px-6 py-2.5 rounded-full border border-[#232B27] text-white text-sm hover:border-[#3A4640] transition-all font-semibold"
                                >
                                    Xem cách hoạt động
                                </a>
                            </div>
                            <div className="flex flex-wrap gap-4 sm:gap-8 pt-6 border-t border-[#232B27] max-w-lg">
                                <div>
                                    <b className="block text-lg font-extrabold text-white">
                                        12.4K+
                                    </b>
                                    <span className="text-xs text-[#5E6B65]">
                                        Freelancer xác minh
                                    </span>
                                </div>
                                <div>
                                    <b className="block text-lg font-extrabold text-white">
                                        38.9K+
                                    </b>
                                    <span className="text-xs text-[#5E6B65]">Dự án hoàn thành</span>
                                </div>
                                <div>
                                    <b className="block text-lg font-extrabold text-white">
                                        92 tỷ ₫
                                    </b>
                                    <span className="text-xs text-[#5E6B65]">Đã giải ngân</span>
                                </div>
                            </div>
                        </div>

                        {/* ESCROW VISUAL */}
                        <div className="relative rounded-3xl border border-[#232B27] bg-[#0F1412] h-[280px] p-5 overflow-hidden">
                            <div className="absolute top-5 left-5 text-[10px] text-[#5E6B65] font-bold tracking-wider">
                                DÒNG TIỀN ESCROW
                            </div>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(18,209,142,0.08),transparent_60%)]"></div>

                            <svg
                                className="absolute inset-0 w-full h-full z-10"
                                viewBox="0 0 400 420"
                                preserveAspectRatio="none"
                            >
                                <path
                                    id="pathA"
                                    d="M 95 210 C 160 210, 160 140, 200 140"
                                    stroke="#232B27"
                                    strokeWidth="2"
                                    fill="none"
                                />
                                <path
                                    id="pathB"
                                    d="M 200 140 C 240 140, 240 210, 305 210"
                                    stroke="#232B27"
                                    strokeWidth="2"
                                    fill="none"
                                />
                                <circle
                                    r="4"
                                    fill="#12D18E"
                                    filter="drop-shadow(0 0 4px rgba(18,209,142,0.8))"
                                >
                                    <animateMotion dur="2.8s" repeatCount="indefinite" begin="0s">
                                        <mpath href="#pathA" />
                                    </animateMotion>
                                </circle>
                                <circle
                                    r="4"
                                    fill="#12D18E"
                                    filter="drop-shadow(0 0 4px rgba(18,209,142,0.8))"
                                >
                                    <animateMotion dur="2.8s" repeatCount="indefinite" begin="1.4s">
                                        <mpath href="#pathB" />
                                    </animateMotion>
                                    <animate
                                        attributeName="opacity"
                                        values="0;1;1;0"
                                        keyTimes="0;0.05;0.9;1"
                                        dur="2.8s"
                                        begin="1.4s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            </svg>

                            <div className="relative z-20 flex justify-between items-center h-full">
                                <div className="flex flex-col items-center gap-2 w-24 text-center">
                                    <div className="w-12 h-12 rounded-xl bg-[#1A211E] border border-[#232B27] flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-[#9FADA6]" />
                                    </div>
                                    <div className="text-[11px] text-white font-semibold mt-1">
                                        Doanh nghiệp
                                    </div>
                                    <div className="text-[10px] text-[#5E6B65]">
                                        Nạp tiền vào Escrow
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 w-24 text-center">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1A211E] to-[#0D1613] border border-[#0E5C43] shadow-[0_0_0_6px_rgba(18,209,142,0.05),_0_0_30px_-8px_rgba(18,209,142,0.35)] flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-[#12D18E]" />
                                    </div>
                                    <div className="text-[11px] text-white font-semibold mt-1">
                                        Ví Escrow
                                    </div>
                                    <div className="text-[10px] text-[#5E6B65]">
                                        Giữ tiền trung gian
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 w-24 text-center">
                                    <div className="w-12 h-12 rounded-xl bg-[#1A211E] border border-[#232B27] flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-[#9FADA6]" />
                                    </div>
                                    <div className="text-[11px] text-white font-semibold mt-1">
                                        Freelancer
                                    </div>
                                    <div className="text-[10px] text-[#5E6B65]">
                                        Nhận tiền khi hoàn thành
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TRUST STRIP */}
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
            .trust-marquee {
              flex: 1; overflow: hidden;
              mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
              -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
            }
            .trust-track {
              display: flex; width: max-content;
              animation: marquee 22s linear infinite;
            }
            .trust-strip-container:hover .trust-track { animation-play-state: paused; }
            @keyframes marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @media (prefers-reduced-motion: reduce) {
              .trust-track { animation: none; }
            }
          `,
                        }}
                    />
                    <div className="py-6 border-y border-[#232B27] overflow-hidden trust-strip-container flex items-center gap-8">
                        <span className="text-xs text-[#5E6B65] font-medium whitespace-nowrap flex-shrink-0 z-10 bg-[#0A0D0C] pr-2">
                            Được tin dùng bởi các đội ngũ tại
                        </span>
                        <div className="trust-marquee">
                            <div className="trust-track">
                                {/* Lặp 2 lần để vòng chạy liền mạch */}
                                {[0, 1].map((i) => (
                                    <div
                                        key={i}
                                        className="flex gap-14 pr-14 opacity-80 hover:opacity-100 transition-opacity"
                                    >
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-blue-400 fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Norva
                                            </b>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-purple-400 fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <circle cx="12" cy="12" r="8" />
                                                <path d="M8 12h8M12 8v8" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Plexo
                                            </b>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-[#12D18E] fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <rect x="4" y="4" width="16" height="16" rx="4" />
                                                <path d="M9 9h6v6H9z" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Quivix
                                            </b>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-amber-400 fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <path d="M4 17l6-10 6 6 4-9" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Tanoa
                                            </b>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-rose-400 fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Brevia
                                            </b>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-cyan-400 fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <circle cx="8" cy="8" r="5" />
                                                <circle cx="16" cy="16" r="5" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Fentra
                                            </b>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-orange-400 fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <path d="M4 4h16v16H4z" />
                                                <path d="M4 12h16" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Kaido
                                            </b>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-shrink-0 group cursor-default">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 stroke-indigo-400 fill-none stroke-[1.8px] group-hover:scale-110 transition-transform"
                                            >
                                                <path d="M12 21c4-3 8-6.5 8-11a8 8 0 1 0-16 0c0 4.5 4 8 8 11z" />
                                            </svg>
                                            <b className="font-bold text-base text-white tracking-[-0.01em] whitespace-nowrap">
                                                Solvane
                                            </b>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FEATURES GRID */}
                    <div className="pt-1 md:px-8">
                        <div className="max-w-2xl mb-6">
                            <div className="text-[#12D18E] text-xs font-semibold mb-2">
                                Vì sao chọn FreelanceX
                            </div>
                            <h2 className="text-2xl lg:text-[28px] font-extrabold text-white leading-tight tracking-tight mb-3">
                                Được xây dựng quanh một lời hứa: an toàn thanh toán
                            </h2>
                            <p className="text-sm text-[#9FADA6]">
                                Không phải nền tảng nào cũng ưu tiên điều này. Với FreelanceX, đó là
                                lý do chúng tôi tồn tại.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-[1px] bg-[#232B27] border border-[#232B27] rounded-3xl overflow-hidden">
                            <div className="lg:col-span-4 bg-[#131917] p-8 flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-lg bg-[rgba(18,209,142,0.16)] flex items-center justify-center mb-4">
                                        <ShieldCheck className="w-5 h-5 text-[#12D18E]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        Hợp đồng thông minh, tiền được khóa từ đầu
                                    </h3>
                                    <p className="text-sm text-[#9FADA6] leading-relaxed">
                                        Khi hai bên ký hợp đồng, khoản thanh toán được chuyển vào ví
                                        Escrow ngay lập tức. Freelancer yên tâm làm việc, doanh
                                        nghiệp yên tâm về tiến độ — tiền chỉ được giải ngân khi công
                                        việc được nghiệm thu.
                                    </p>
                                </div>
                                <div className="mt-8 h-44 rounded-xl bg-gradient-to-br from-[#1A211E] to-[#0F1412] border border-[#232B27] flex items-center justify-center">
                                    <svg width="70%" height="60%" viewBox="0 0 200 100">
                                        <rect
                                            x="10"
                                            y="35"
                                            width="55"
                                            height="30"
                                            rx="6"
                                            fill="none"
                                            stroke="#2A332E"
                                            strokeWidth="1.5"
                                        />
                                        <rect
                                            x="72"
                                            y="20"
                                            width="56"
                                            height="60"
                                            rx="8"
                                            fill="none"
                                            stroke="#12D18E"
                                            strokeWidth="1.8"
                                        />
                                        <rect
                                            x="135"
                                            y="35"
                                            width="55"
                                            height="30"
                                            rx="6"
                                            fill="none"
                                            stroke="#2A332E"
                                            strokeWidth="1.5"
                                        />
                                        <line
                                            x1="65"
                                            y1="50"
                                            x2="72"
                                            y2="50"
                                            stroke="#3A4640"
                                            strokeWidth="1.5"
                                        />
                                        <line
                                            x1="128"
                                            y1="50"
                                            x2="135"
                                            y2="50"
                                            stroke="#3A4640"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="lg:col-span-3 flex flex-col gap-[1px] bg-[#232B27]">
                                <div className="bg-[#131917] p-8 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-[rgba(18,209,142,0.16)] flex items-center justify-center mb-4">
                                        <Globe className="w-5 h-5 text-[#12D18E]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        Freelancer đã xác minh danh tính
                                    </h3>
                                    <p className="text-sm text-[#9FADA6] leading-relaxed">
                                        Mỗi hồ sơ đều qua kiểm tra CCCD và lịch sử làm việc trước
                                        khi được duyệt tham gia nền tảng.
                                    </p>
                                </div>
                                <div className="bg-[#131917] p-8 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-[rgba(18,209,142,0.16)] flex items-center justify-center mb-4">
                                        <Zap className="w-5 h-5 text-[#12D18E]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        Hỗ trợ xử lý tranh chấp
                                    </h3>
                                    <p className="text-sm text-[#9FADA6] leading-relaxed">
                                        Đội ngũ trung gian can thiệp trong vòng 24h nếu hai bên bất
                                        đồng về kết quả bàn giao.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HOW IT WORKS */}
                    <div id="how" className="pt-8 md:px-8">
                        <div className="max-w-2xl mb-6">
                            <div className="text-[#12D18E] text-xs font-semibold mb-2">
                                Cách hoạt động
                            </div>
                            <h2 className="text-2xl lg:text-[28px] font-extrabold text-white leading-tight tracking-tight">
                                Từ lúc đăng dự án đến khi nhận tiền
                            </h2>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="hidden md:block absolute top-5 left-[5%] right-[5%] h-[1px] bg-[#232B27] z-0"></div>

                            <div className="relative z-10 pr-2">
                                <div className="w-10 h-10 rounded-full bg-[#0A0D0C] border border-[#0E5C43] text-[#12D18E] flex items-center justify-center font-bold text-base mb-4">
                                    1
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1.5">Đăng dự án</h4>
                                <p className="text-xs text-[#5E6B65] leading-relaxed">
                                    Mô tả công việc, ngân sách và thời hạn mong muốn.
                                </p>
                            </div>

                            <div className="relative z-10 pr-2">
                                <div className="w-10 h-10 rounded-full bg-[#0A0D0C] border border-[#0E5C43] text-[#12D18E] flex items-center justify-center font-bold text-base mb-4">
                                    2
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1.5">
                                    Chọn freelancer
                                </h4>
                                <p className="text-xs text-[#5E6B65] leading-relaxed">
                                    Duyệt hồ sơ, đánh giá và trò chuyện trước khi ký.
                                </p>
                            </div>

                            <div className="relative z-10 pr-2">
                                <div className="w-10 h-10 rounded-full bg-[#0A0D0C] border border-[#0E5C43] text-[#12D18E] flex items-center justify-center font-bold text-base mb-4">
                                    3
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1.5">Ký hợp đồng</h4>
                                <p className="text-xs text-[#5E6B65] leading-relaxed">
                                    Tiền chuyển vào ví Escrow, khóa chờ hoàn thành.
                                </p>
                            </div>

                            <div className="relative z-10 pr-2">
                                <div className="w-10 h-10 rounded-full bg-[#0A0D0C] border border-[#0E5C43] text-[#12D18E] flex items-center justify-center font-bold text-base mb-4">
                                    4
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1.5">Nghiệm thu</h4>
                                <p className="text-xs text-[#5E6B65] leading-relaxed">
                                    Freelancer nộp sản phẩm, khách hàng kiểm tra.
                                </p>
                            </div>

                            <div className="relative z-10 pr-2">
                                <div className="w-10 h-10 rounded-full bg-[#0A0D0C] border border-[#0E5C43] text-[#12D18E] flex items-center justify-center font-bold text-base mb-4">
                                    5
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1.5">Giải ngân</h4>
                                <p className="text-xs text-[#5E6B65] leading-relaxed">
                                    Tiền chuyển ngay cho freelancer sau khi duyệt.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FINAL CTA */}
                    <div className="mt-10 mx-0 md:mx-8 rounded-[24px] bg-gradient-to-br from-[#0F1F1A] to-[#0F1412] border border-[#0E5C43] p-12 text-center relative overflow-hidden">
                        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(18,209,142,0.15),transparent_70%)]"></div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3 relative z-10">
                            Sẵn sàng làm việc mà không lo về tiền?
                        </h2>
                        <p className="text-sm text-[#9FADA6] mb-6 relative z-10">
                            Tạo tài khoản miễn phí trong 2 phút. Không cần thẻ tín dụng.
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#12D18E] text-[#06140F] font-bold text-sm hover:-translate-y-0.5 hover:shadow-[0_6px_24px_-4px_rgba(18,209,142,0.45)] transition-all relative z-10"
                        >
                            Tạo tài khoản ngay
                        </a>
                    </div>
                </div>
            )}
        </main>
    );
}
