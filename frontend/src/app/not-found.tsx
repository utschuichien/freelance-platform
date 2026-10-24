import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        
        <h1 className="text-[120px] md:text-[160px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#12D18E] to-blue-600">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Không tìm thấy trang
          </h2>
          <p className="text-[#94A3B8] max-w-sm mx-auto">
            Đường dẫn bạn truy cập không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
          </p>
        </div>
        
        <div className="pt-6 flex justify-center">
          <Link href="/">
            <Button className="h-12 px-8 rounded-xl bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] font-bold transition-all">
              <Home className="w-5 h-5 mr-2" />
              Trở về Trang chủ
            </Button>
          </Link>
        </div>
        
      </div>
    </div>
  );
}
