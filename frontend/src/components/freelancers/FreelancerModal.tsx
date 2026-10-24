import { X, Star, MapPin, CheckCircle2, MessageSquare, Briefcase, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCreateDirectConversation } from "@/hooks/api/useChat";

interface FreelancerModalProps {
  freelancer: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function FreelancerModal({ freelancer, isOpen, onClose }: FreelancerModalProps) {
  const router = useRouter();
  const { mutate: createChat, isPending: isCreatingChat } = useCreateDirectConversation();

  if (!isOpen) return null;

  const handleStartChat = () => {
    // ID from mock data is something like f-1, but the API expects a valid ID. We just pass it.
    createChat(freelancer.id, {
      onSuccess: () => {
        onClose();
        router.push("/messages");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0C0C0C] border border-[#222222] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 relative flex flex-col">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 z-10 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <main className="p-5 md:p-6 flex-1 w-full">
          {/* Header Cover */}
          <div className="relative rounded-2xl overflow-hidden glass-card border border-[#222222]">
            <div className="h-32 bg-gradient-to-r from-[#12D18E]/20 to-blue-500/20"></div>
            <div className="px-5 md:px-6 pb-6 pt-0 flex flex-col md:flex-row md:items-end gap-6 relative -top-12">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <UserAvatar seed={freelancer.name} src={freelancer.avatar} className="w-28 h-28 border-[#12D18E] border-2 shadow-[0_0_20px_rgba(18,209,142,0.3)] bg-[#111111]" />
                {freelancer.verified && (
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#111111] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-1 mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    {freelancer.name}
                  </h1>
                  <div className="flex flex-col sm:items-end">
                    <span className="text-xl font-black text-[#12D18E]">{formatCurrency(freelancer.hourlyRate)}</span>
                    <span className="text-[11px] text-[#64748B]">/ giờ</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#94A3B8]">
                  {freelancer.title}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#64748B] pt-2">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-bold">{freelancer.rating}</span> ({freelancer.reviews} đánh giá)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {freelancer.location}
                  </span>
                  <span className={`flex items-center gap-1.5 ${freelancer.isAvailable ? 'text-[#12D18E]' : 'text-[#64748B]'}`}>
                    <span className={`w-2 h-2 rounded-full ${freelancer.isAvailable ? 'bg-[#12D18E]' : 'bg-[#64748B]'}`}></span>
                    {freelancer.isAvailable ? 'Đang rảnh rỗi' : 'Đang bận'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column (Main Info) */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#12D18E]" />
                  Giới thiệu bản thân
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Xin chào, tôi là một chuyên gia {freelancer.title} với nhiều năm kinh nghiệm trong ngành. Tôi luôn cam kết mang lại những sản phẩm chất lượng cao nhất cho khách hàng, chú trọng vào cả trải nghiệm người dùng và hiệu suất của hệ thống. 
                  Sự hài lòng của khách hàng là ưu tiên số một của tôi.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kỹ năng nổi bật</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#222222] text-xs text-white font-medium hover:border-[#12D18E]/50 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Actions & Stats) */}
            <div className="space-y-4">
              <div className="glass-card p-4 rounded-xl border border-[#222222] space-y-4">
                <Button 
                  onClick={() => {
                    onClose();
                    router.push(`/freelancers/${freelancer.id}`);
                  }}
                  className="w-full rounded-xl bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] font-bold py-5"
                >
                  Xem Chi Tiết & Mời Làm Việc
                </Button>
                <Button 
                  onClick={handleStartChat}
                  disabled={isCreatingChat}
                  variant="outline" 
                  className="w-full rounded-xl bg-transparent border-[#222222] text-white hover:bg-[#161616] font-bold py-5"
                >
                  {isCreatingChat ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#12D18E]" /> : <MessageSquare className="w-4 h-4 mr-2 text-[#12D18E]" />}
                  Nhắn Tin
                </Button>
              </div>

              <div className="glass-card p-4 rounded-xl border border-[#222222] space-y-3">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Thống kê</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#94A3B8]">Dự án hoàn thành</span>
                  <span className="text-white font-bold">12</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#94A3B8]">Tỉ lệ phản hồi</span>
                  <span className="text-[#12D18E] font-bold">98%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#94A3B8]">Ngôn ngữ</span>
                  <span className="text-white font-bold">Tiếng Việt, Tiếng Anh</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
