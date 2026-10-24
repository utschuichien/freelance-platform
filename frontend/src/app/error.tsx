'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full" />
        <div className="relative bg-[#0C0C0C] border border-white/5 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center">
          <div className="bg-red-500/10 p-4 rounded-2xl mb-6 text-red-500 border border-red-500/20">
            <ShieldAlert className="w-12 h-12" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2">
            Hệ Thống Gặp Lỗi
          </h1>
          <p className="text-[#94A3B8] max-w-sm mb-8">
            Đã có sự cố bất ngờ xảy ra trong quá trình xử lý yêu cầu của bạn. Đội ngũ kỹ thuật đã được thông báo.
          </p>
          
          <Button 
            onClick={() => reset()}
            className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 font-bold transition-all"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Thử Lại Ngay
          </Button>
        </div>
      </div>
      
      <div className="text-[10px] font-mono text-[#64748B] tracking-widest uppercase">
        FreelanceX // System Error 500
      </div>
    </div>
  );
}
