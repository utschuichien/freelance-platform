import { Search, ShieldCheck, Zap } from 'lucide-react';

interface HeroBannerProps {
    user: any;
    mounted: boolean;
}

export default function HeroBanner({ user, mounted }: HeroBannerProps) {
    return (
        <>
            {/* Custom Animations for Hero */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float-center {
                    0% { transform: translate(-50%, -50%) translateY(0px) rotateX(10deg) rotateY(-15deg); }
                    50% { transform: translate(-50%, -50%) translateY(-10px) rotateX(12deg) rotateY(-12deg); }
                    100% { transform: translate(-50%, -50%) translateY(0px) rotateX(10deg) rotateY(-15deg); }
                }
                @keyframes float-left {
                    0% { transform: translateX(-16px) translateY(0px) rotateX(5deg) rotateY(20deg); }
                    50% { transform: translateX(-16px) translateY(-8px) rotateX(8deg) rotateY(18deg); }
                    100% { transform: translateX(-16px) translateY(0px) rotateX(5deg) rotateY(20deg); }
                }
                @keyframes float-right {
                    0% { transform: translateX(16px) translateY(0px) rotateX(15deg) rotateY(-25deg); }
                    50% { transform: translateX(16px) translateY(12px) rotateX(12deg) rotateY(-28deg); }
                    100% { transform: translateX(16px) translateY(0px) rotateX(15deg) rotateY(-25deg); }
                }
                @keyframes wave {
                    0% { transform: rotate(0.0deg) }
                    10% { transform: rotate(14.0deg) }
                    20% { transform: rotate(-8.0deg) }
                    30% { transform: rotate(14.0deg) }
                    40% { transform: rotate(-4.0deg) }
                    50% { transform: rotate(10.0deg) }
                    60% { transform: rotate(0.0deg) }
                    100% { transform: rotate(0.0deg) }
                }
                .animate-float-center { animation: float-center 6s ease-in-out infinite; }
                .animate-float-left { animation: float-left 5s ease-in-out infinite; }
                .animate-float-right { animation: float-right 7s ease-in-out infinite; }
                .animate-wave { animation: wave 2.5s infinite; transform-origin: 70% 70%; display: inline-block; }
            `}} />

            {/* Welcome Hero Banner Card */}
            <div className="rounded-3xl bg-[#090C0A] border border-white/5 p-6 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-8 shadow-2xl">
                {/* Background glowing effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#12D18E]/10 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Left side content */}
                <div className="space-y-6 z-10 flex-1 max-w-lg w-full">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex flex-wrap items-center gap-2 tracking-tight">
                            {!mounted ? (
                                <div className="w-64 h-8 bg-white/5 animate-pulse rounded-xl"></div>
                            ) : user ? (
                                <>Xin chào, {user.fullName} <span className="animate-wave">👋</span></>
                            ) : (
                                <>Khám phá cơ hội mới <span className="animate-wave">🚀</span></>
                            )}
                        </h1>
                        <p className="text-[#9FADA6] text-xs md:text-sm max-w-sm">
                            {!mounted
                                ? ''
                                : user
                                    ? 'Luôn sẵn sàng cho những cơ hội mới và quản lý dự án hiệu quả!'
                                    : 'Nền tảng kết nối nhân tài và doanh nghiệp hàng đầu với bảo mật Escrow.'}
                        </p>
                    </div>
                </div>

                {/* Right side floating CSS art */}
                <div className="hidden lg:block relative w-[380px] h-[180px] z-10" style={{ perspective: '1000px' }}>
                    {/* Glowing Orbs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#12D18E]/20 rounded-full blur-3xl"></div>

                    {/* Center Laptop/Screen */}
                    <div className="absolute top-1/2 left-1/2 w-[220px] h-[140px] bg-[#161616]/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md animate-float-center overflow-hidden">
                        {/* Screen Header */}
                        <div className="h-4 border-b border-white/10 flex items-center px-2 gap-1.5 bg-black/40">
                            <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                        </div>
                        {/* Screen Content */}
                        <div className="p-4 space-y-4">
                            <div className="flex gap-3 items-center">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex shrink-0"></div>
                                <div className="space-y-1.5 flex-1">
                                    <div className="w-2/3 h-2 bg-white/10 rounded-full"></div>
                                    <div className="w-1/3 h-1.5 bg-white/5 rounded-full"></div>
                                </div>
                            </div>
                            <div className="w-full h-12 bg-gradient-to-r from-[#12D18E]/10 to-transparent border border-[#12D18E]/20 rounded-lg"></div>
                            <div className="space-y-2">
                                <div className="w-full h-1.5 bg-white/5 rounded-full"></div>
                                <div className="w-5/6 h-1.5 bg-white/5 rounded-full"></div>
                                <div className="w-4/6 h-1.5 bg-white/5 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Left Floating Card */}
                    <div className="absolute top-[10%] left-0 w-[90px] h-[100px] bg-[#161616]/80 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md animate-float-left flex flex-col justify-center items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#12D18E]/20 to-[#12D18E]/5 border border-[#12D18E]/30 flex items-center justify-center shadow-[0_0_15px_rgba(18,209,142,0.3)]">
                            <ShieldCheck className="w-5 h-5 text-[#12D18E]" />
                        </div>
                        <div className="space-y-1.5 flex flex-col items-center">
                            <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                            <div className="w-8 h-1.5 bg-white/10 rounded-full"></div>
                        </div>
                    </div>

                    {/* Right Floating Card */}
                    <div className="absolute bottom-[10%] right-4 w-[100px] h-[80px] bg-[#161616]/80 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md animate-float-right flex flex-col justify-center items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="space-y-1.5 flex flex-col items-center">
                            <div className="w-14 h-1.5 bg-white/20 rounded-full"></div>
                            <div className="w-10 h-1 bg-white/10 rounded-full"></div>
                        </div>
                    </div>

                    {/* Small Floating Elements */}
                    <div className="absolute top-[20%] right-[15%] w-6 h-6 rounded-lg bg-gradient-to-br from-[#12D18E]/20 to-transparent border border-[#12D18E]/30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-[20%] left-[10%] w-4 h-4 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent border border-amber-400/30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>
        </>
    );
}
