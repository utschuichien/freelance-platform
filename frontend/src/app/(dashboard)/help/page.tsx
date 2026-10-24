'use client';

import {
    ShieldCheck,
    MessageSquare,
    Mail,
    PhoneCall,
    Briefcase,
    CreditCard,
    Star,
    ArrowRight,
    CheckCircle2,
    FileCheck2,
    Lock,
    Headphones,
    Scale,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HelpPage() {
    return (
        <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-5 flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Header */}
            <div className="text-center space-y-1 py-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    Hỗ Trợ & Hướng Dẫn Vận Hành
                </h1>
                <p className="text-sm text-[#94A3B8] max-w-xl mx-auto">
                    Tìm hiểu quy trình làm việc chuẩn an toàn và kết nối trực tiếp với đội ngũ hỗ trợ kỹ thuật 24/7.
                </p>
            </div>

            {/* Quy trình vận hành 4 bước (Workflow Pipeline) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#12D18E]" />
                        Quy trình hợp tác an toàn trên nền tảng
                    </h2>
                    <span className="text-xs text-[#64748B]">Bảo vệ 100% dòng tiền</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Bước 1 */}
                    <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3 relative">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                            01
                        </div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-blue-400" />
                            Đăng Việc & Báo Giá
                        </h3>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Khách hàng đăng tin dự án. Freelancer xem xét yêu cầu và gửi đề xuất chào thầu (Proposal).
                        </p>
                    </div>

                    {/* Bước 2 */}
                    <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3 relative">
                        <div className="w-10 h-10 rounded-xl bg-[#12D18E]/10 border border-[#12D18E]/20 text-[#12D18E] flex items-center justify-center font-bold text-sm">
                            02
                        </div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-[#12D18E]" />
                            Ký Quỹ Escrow
                        </h3>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Tiền thầu được hệ thống khóa an toàn. Freelancer yên tâm bắt tay vào thực hiện công việc.
                        </p>
                    </div>

                    {/* Bước 3 */}
                    <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3 relative">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                            03
                        </div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <FileCheck2 className="w-4 h-4 text-amber-400" />
                            Nộp & Nghiệm Thu
                        </h3>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Freelancer nộp bài theo từng cột mốc. Khách hàng kiểm duyệt hoặc yêu cầu chỉnh sửa nếu cần.
                        </p>
                    </div>

                    {/* Bước 4 */}
                    <div className="p-5 rounded-2xl bg-[#141414] border border-[#222222] space-y-3 relative">
                        <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                            04
                        </div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-purple-400" />
                            Giải Ngân & Đánh Giá
                        </h3>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Tiền tự động về ví Freelancer. Cả hai bên gửi nhận xét và chấm sao đánh giá uy tín 2 chiều.
                        </p>
                    </div>
                </div>
            </div>

            {/* Các kênh kết nối hỗ trợ trực tiếp (Direct Support Channels) */}
            <div className="space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#12D18E]" />
                    Kênh liên hệ hỗ trợ trực tiếp
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Channel 1: Live Messages */}
                    <div className="p-6 rounded-2xl bg-[#141414] border border-[#222222] hover:border-[#12D18E]/30 transition-colors space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="w-11 h-11 rounded-xl bg-[#12D18E]/10 border border-[#12D18E]/20 text-[#12D18E] flex items-center justify-center">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-white">Tin Nhắn Trực Tiếp</h3>
                            <p className="text-xs text-[#94A3B8] leading-relaxed">
                                Trao đổi thời gian thực với quản trị viên để xử lý các vấn đề về hợp đồng và thanh toán.
                            </p>
                        </div>
                        <Link href="/messages" className="block pt-2">
                            <Button className="w-full bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] font-bold text-xs h-10">
                                Mở khung chat ngay <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Channel 2: Email */}
                    <div className="p-6 rounded-2xl bg-[#141414] border border-[#222222] hover:border-blue-400/30 transition-colors space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400 flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-white">Hỗ Trợ Qua Email</h3>
                            <p className="text-xs text-[#94A3B8] leading-relaxed">
                                Gửi tài liệu, đối soát tài chính hoặc văn bản khiếu nại tới hòm thư chính thức.
                            </p>
                            <p className="text-xs font-semibold text-white bg-black/40 p-2 rounded-lg border border-white/5">
                                support@freelancex.vn
                            </p>
                        </div>
                        <div className="pt-2">
                            <a href="mailto:support@freelancex.vn" className="block">
                                <Button variant="outline" className="w-full border-[#2A2A2A] text-white hover:bg-[#1E1E1E] font-bold text-xs h-10">
                                    Gửi thư điện tử
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Channel 3: Hotline */}
                    <div className="p-6 rounded-2xl bg-[#141414] border border-[#222222] hover:border-amber-400/30 transition-colors space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
                                <PhoneCall className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-white">Tổng Đài Khẩn Cấp</h3>
                            <p className="text-xs text-[#94A3B8] leading-relaxed">
                                Hỗ trợ 24/7 đối với các trường hợp khẩn cấp về tranh chấp hoặc bảo mật tài khoản.
                            </p>
                            <p className="text-xs font-semibold text-white bg-black/40 p-2 rounded-lg border border-white/5">
                                1900 8888 (Miễn phí cước gọi)
                            </p>
                        </div>
                        <div className="pt-2">
                            <a href="tel:19008888" className="block">
                                <Button variant="outline" className="w-full border-[#2A2A2A] text-white hover:bg-[#1E1E1E] font-bold text-xs h-10">
                                    Gọi tổng đài
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quy chế & Cam kết an toàn (Safety Guarantees & Policy Cards) */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#222222] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#12D18E]" />
                    Cam kết bảo vệ quyền lợi người dùng
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1E1E1E] space-y-1.5">
                        <span className="font-bold text-white block">Hoàn tiền minh bạch</span>
                        <p className="text-[#94A3B8] leading-relaxed">
                            Khách hàng có quyền đơn phương hủy hợp đồng khi đối tác không thực hiện cam kết và nhận lại 100% tiền cọc chưa giải ngân.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1E1E1E] space-y-1.5">
                        <span className="font-bold text-white block">Trọng tài trung lập</span>
                        <p className="text-[#94A3B8] leading-relaxed">
                            Mọi khiếu nại đều được đội ngũ kiểm duyệt xem xét dựa trên nhật ký trao đổi, lịch sử nộp bài và tiêu chí công việc ban đầu.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1E1E1E] space-y-1.5">
                        <span className="font-bold text-white block">Đánh giá trung thực</span>
                        <p className="text-[#94A3B8] leading-relaxed">
                            Đánh giá chỉ được kích hoạt sau khi giao dịch hoàn tất, áp dụng khóa chống spam và không thể tự ý sửa đổi sau khi gửi.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
