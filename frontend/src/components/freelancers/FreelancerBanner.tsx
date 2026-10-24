import { Users, FileCheck, Star } from "lucide-react";

export default function FreelancerBanner() {
    return (
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0A100E] via-[#0D1814] to-[#0A1410] border border-[#232B27] p-5 md:p-6 overflow-hidden min-h-[180px] flex flex-col justify-center m-0 mt-0">
            {/* Glows */}
            <div className="absolute top-0 right-1/4 w-[250px] h-[250px] bg-[#12D18E]/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-[850px] mx-auto">
                <div className="space-y-4 w-full md:w-1/2">
                    <div className="space-y-2">
                        <h1 className="text-xl md:text-2xl leading-[1.2] font-extrabold text-white tracking-tight">
                            Khám phá tài năng phù hợp<br/>
                            <span className="text-[#12D18E]">cho dự án của bạn</span>
                        </h1>
                        <p className="text-[12px] md:text-[13px] text-[#9FADA6] max-w-[400px] leading-relaxed">
                            Kết nối với các freelancer chuyên nghiệp, giàu kinh nghiệm và sẵn sàng hợp tác ngay hôm nay!
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-2 bg-[#12D18E]/5 border border-[#12D18E]/10 px-3 py-2 rounded-xl">
                            <Users className="w-3.5 h-3.5 text-[#12D18E]" />
                            <div>
                                <div className="text-[12px] font-bold text-white">8,200+</div>
                                <div className="text-[8px] text-[#8F9F97] uppercase tracking-wider">Freelancers</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-[#12D18E]/5 border border-[#12D18E]/10 px-3 py-2 rounded-xl">
                            <FileCheck className="w-3.5 h-3.5 text-[#12D18E]" />
                            <div>
                                <div className="text-[12px] font-bold text-white">95%</div>
                                <div className="text-[8px] text-[#8F9F97] uppercase tracking-wider">Hoàn thành</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-[#12D18E]/5 border border-[#12D18E]/10 px-3 py-2 rounded-xl">
                            <Star className="w-3.5 h-3.5 text-[#12D18E]" />
                            <div>
                                <div className="text-[12px] font-bold text-white">4.8/5</div>
                                <div className="text-[8px] text-[#8F9F97] uppercase tracking-wider">Đánh giá</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Graphic mockup on the right */}
                <div className="hidden lg:flex relative flex-1 justify-center items-center h-full min-h-[180px] w-full md:w-1/2">
                    <div className="relative w-full max-w-[360px] h-[200px] flex items-center justify-center">
                        {/* Pure CSS Laptop Mockup */}
                        <div className="absolute inset-0 flex justify-center items-center mt-4">
                            <div className="absolute w-[200px] h-[200px] bg-[#12D18E]/20 blur-[60px] rounded-full"></div>
                            
                            <div className="relative z-10 flex flex-col items-center group cursor-default">
                                {/* Screen */}
                                <div className="w-[260px] h-[160px] bg-[#0A100E] border-[5px] border-[#1C2420] rounded-t-xl rounded-b-sm flex flex-col overflow-hidden relative shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                                    {/* Screen Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#12D18E]/10 to-transparent"></div>
                                    
                                    {/* Top camera/bar */}
                                    <div className="absolute top-0 left-0 right-0 h-3 flex justify-center items-center z-20">
                                        <div className="w-1.5 h-1.5 bg-[#06140F] border border-[#232B27] rounded-full"></div>
                                    </div>
                                    
                                    {/* Dashboard UI mockup inside screen */}
                                    <div className="pt-5 p-4 space-y-4 relative z-10 w-full">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-7 h-7 rounded-full bg-[#12D18E]/20 flex items-center justify-center flex-shrink-0">
                                                <div className="w-3 h-3 bg-[#12D18E] rounded-full"></div>
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-1.5 w-3/4 bg-white/90 rounded-full"></div>
                                                <div className="h-1.5 w-1/2 bg-[#5E6B65] rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-1.5 w-full bg-[#12D18E]/80 rounded-full"></div>
                                                <div className="h-1.5 w-1/3 bg-[#5E6B65] rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <div className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-1.5 w-1/2 bg-white/70 rounded-full"></div>
                                                <div className="h-1.5 w-3/4 bg-[#5E6B65] rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Keyboard Base */}
                                <div className="w-[300px] h-[10px] bg-gradient-to-b from-[#3A4640] to-[#1C2420] rounded-b-xl relative z-20 shadow-[0_15px_35px_rgba(18,209,142,0.25)] transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#12D18E]/60 to-transparent"></div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#0A100E] rounded-b-md"></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Floating tags (Updated for Freelancers) */}
                        <div className="absolute top-0 left-0 bg-[#161C19]/90 backdrop-blur-md border border-[#232B27] px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white shadow-xl flex items-center gap-2 -rotate-6 hover:scale-105 transition-transform z-30">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> React
                        </div>
                        <div className="absolute bottom-6 left-2 bg-[#161C19]/90 backdrop-blur-md border border-[#12D18E]/40 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-[#12D18E] shadow-[0_0_15px_rgba(18,209,142,0.15)] flex items-center gap-2 rotate-3 hover:scale-105 transition-transform z-30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#12D18E]"></span> UI/UX
                        </div>
                        <div className="absolute top-6 right-0 bg-[#161C19]/90 backdrop-blur-md border border-[#232B27] px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white shadow-xl flex items-center gap-2 rotate-6 hover:scale-105 transition-transform z-30">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Node.js
                        </div>
                        <div className="absolute bottom-10 right-4 bg-[#161C19]/90 backdrop-blur-md border border-[#232B27] px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white shadow-xl flex items-center gap-2 -rotate-3 hover:scale-105 transition-transform z-30">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> TypeScript
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
