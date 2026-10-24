import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col md:flex-row">
      {/* Left Pane - Branding & Pattern */}
      <div className="hidden md:flex md:w-1/2 bg-[#111111] border-r border-[#222222] flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        
        <div className="relative z-10 space-y-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <div className="w-10 h-10 rounded-full bg-[#12D18E] flex items-center justify-center text-black font-black text-2xl">
              F
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Freelance<span className="text-[#94A3B8] font-normal">X</span>
            </span>
          </Link>
          <h1 className="text-4xl font-black text-white leading-tight">
            Nền tảng ký quỹ Escrow <br />
            <span className="text-[#12D18E]">Bảo mật & Đáng tin cậy.</span>
          </h1>
          <p className="text-[#94A3B8] max-w-md">
            Mọi giao dịch đều được bảo vệ bằng Smart Contract. Đảm bảo quyền lợi tuyệt đối cho cả Freelancer và Client.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-[#111111] flex items-center justify-center font-bold text-xs text-white">JD</div>
              <div className="w-10 h-10 rounded-full bg-rose-500 border-2 border-[#111111] flex items-center justify-center font-bold text-xs text-white">AN</div>
              <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-[#111111] flex items-center justify-center font-bold text-xs text-white">MK</div>
            </div>
            <div className="text-sm">
              <p className="text-white font-bold">10,000+ người dùng</p>
              <p className="text-[#64748B]">Đã tham gia nền tảng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        
        {/* Mobile-only Logo & Back button */}
        <div className="absolute top-6 left-6 md:hidden">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#12D18E] flex items-center justify-center text-black font-black text-lg">
              F
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Freelance<span className="text-[#94A3B8] font-normal">X</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-12 md:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
