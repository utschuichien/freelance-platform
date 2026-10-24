import { Star, MapPin, CheckCircle2, MessageSquare, Bookmark, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";
import { useState } from "react";
import FreelancerModal from "./FreelancerModal";
import { toast } from "sonner";

export interface FreelancerCardData {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  skills: string[];
  location: string;
  verified: boolean;
  isAvailable: boolean;
}

interface FreelancerCardProps {
  freelancer: FreelancerCardData;
}

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    toast.success(!isBookmarked ? `Đã lưu hồ sơ của ${freelancer.name}` : `Đã bỏ lưu hồ sơ của ${freelancer.name}`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 p-5 bg-[#0F1412]/50 border-b border-[#232B27] hover:bg-[#12D18E]/5 transition-colors group">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-[#232B27]">
          <UserAvatar seed={freelancer.name} src={freelancer.avatar} className="w-full h-full" />
        </div>
        
        {/* Info Left */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  onClick={() => setIsModalOpen(true)}
                  className="text-white font-bold text-[15px] hover:text-[#12D18E] cursor-pointer transition-colors"
                >
                  {freelancer.name}
                </h3>
                {freelancer.verified && (
                  <span className="px-2 py-0.5 rounded-full bg-[#12D18E]/10 border border-[#12D18E]/20 text-[#12D18E] text-[10px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Đã xác thực
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[10px] text-white font-medium sm:ml-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${freelancer.isAvailable ? 'bg-[#12D18E]' : 'bg-[#5E6B65]'}`}></span> 
                  {freelancer.isAvailable ? 'Online' : 'Offline'}
                </span>
            </div>
            
            <div className="text-[#9FADA6] text-[13px] mt-0.5">{freelancer.title}</div>
            
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5E6B65] mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {freelancer.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 4 năm kinh nghiệm
                </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5E6B65] mt-1.5">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 
                  <span className="text-white font-bold">{freelancer.rating}</span> ({freelancer.reviews})
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành {Math.floor(Math.random() * 50) + 10} dự án
                </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
                {freelancer.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full bg-[#161C19] border border-[#232B27] text-[#9FADA6] text-[10px]">
                    {skill}
                  </span>
                ))}
            </div>
        </div>
        
        {/* Info Right */}
        <div className="flex flex-col sm:justify-between items-start sm:items-end shrink-0 sm:pl-4 sm:border-l border-[#232B27]/50 mt-4 sm:mt-0 gap-4 sm:gap-0">
            <div className="text-left sm:text-right">
                <div className="text-[#12D18E] font-bold text-[15px]">
                  {formatCurrency(freelancer.hourlyRate)} <span className="text-[#5E6B65] text-[11px] font-normal">/ giờ</span>
                </div>
                <div className="text-[#5E6B65] text-[10px] mt-0.5">Tùy theo yêu cầu dự án</div>
            </div>
            <div className="flex items-center gap-2 mt-auto w-full sm:w-auto">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 sm:flex-none h-9 px-4 rounded-xl bg-[#12D18E] hover:bg-[#0EAE75] text-[#0C0C0C] font-bold text-[13px] transition-colors"
                >
                  Xem hồ sơ
                </Button>
                <Button 
                  onClick={toggleBookmark}
                  variant="outline" 
                  size="icon" 
                  className={`h-9 w-9 shrink-0 rounded-xl border-[#232B27] bg-[#161C19] transition-colors ${
                    isBookmarked ? 'text-[#12D18E] border-[#12D18E]/50' : 'text-[#9FADA6] hover:text-white hover:border-[#3A4640]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#12D18E]' : ''}`} />
                </Button>
            </div>
        </div>
      </div>

      <FreelancerModal 
        freelancer={freelancer} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
