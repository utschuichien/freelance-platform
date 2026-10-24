import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Bookmark, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { toast } from "sonner";

export interface JobCardItem {
  id: string;
  title: string;
  company: string;
  avatar?: string;
  location: string;
  type: string[];
  budget: string;
  skills: string[];
  postedAt: string;
  verified?: boolean;
  logoColor?: string;
}

interface ProjectCardProps {
  project: JobCardItem;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    toast.success(!isBookmarked ? "Đã lưu dự án vào danh sách quan tâm" : "Đã bỏ lưu dự án");
  };

  return (
    <div className="p-5 rounded-[24px] bg-[#0A0D0C] border border-[#232B27] hover:border-[#12D18E]/30 transition-all duration-300 group flex flex-col sm:flex-row gap-5">
      
      {/* Left: Avatar using user's UserAvatar component */}
      <Link href={`/jobs/${project.id}`} className="shrink-0">
        <UserAvatar 
          seed={project.company || project.title} 
          src={project.avatar} 
          className="w-12 h-12 rounded-xl border-[#232B27] group-hover:border-[#12D18E]/50 transition-colors" 
        />
      </Link>

      {/* Middle: Info */}
      <div className="flex-1 space-y-2.5">
        <div>
            <Link href={`/jobs/${project.id}`}>
              <h3 className="font-extrabold text-[15px] text-white group-hover:text-[#12D18E] transition-colors leading-tight cursor-pointer">
                  {project.title}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mt-1.5 text-[13px] text-[#8F9F97]">
                <span className="font-bold text-white">{project.company}</span>
                {project.verified && (
                    <span className="flex items-center gap-1 text-[#12D18E] text-[10px] px-2 py-0.5 rounded-full bg-[#12D18E]/10 font-bold">
                        <BadgeCheck className="w-3 h-3" /> Đã xác thực
                    </span>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] font-medium text-[#5E6B65]">
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#5E6B65]" /> {project.location}</span>
                <div className="flex items-center gap-3">
                    {project.type.map((t: string, i: number) => (
                        <span key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#3A4640]"></span> {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1.5">
            {project.skills.map((skill: string, idx: number) => (
            <span key={idx} className="px-2.5 py-1 rounded-full bg-[#161C19] border border-[#232B27] text-[10px] text-[#9FADA6] font-semibold hover:bg-[#12D18E]/10 hover:text-[#12D18E] hover:border-[#12D18E]/20 transition-colors cursor-pointer">
                {skill}
            </span>
            ))}
        </div>
      </div>

      {/* Right: Budget & Action */}
      <div className="flex flex-col justify-between sm:items-end border-t sm:border-t-0 sm:border-l border-[#232B27] pt-4 sm:pt-0 sm:pl-5 shrink-0 w-full sm:w-auto sm:min-w-[200px]">
        <div className="text-left sm:text-right w-full flex sm:block justify-between items-center mb-4 sm:mb-0">
            <span className="block text-[15px] font-extrabold text-[#12D18E]">
                {project.budget} <span className="text-[10px] text-[#5E6B65] font-medium">/ tháng</span>
            </span>
            <span className="text-[10px] text-[#5E6B65] mt-1 font-medium">{project.postedAt}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => router.push(`/jobs/${project.id}`)}
              className="flex-1 sm:flex-none h-9 text-[12px] bg-[#12D18E]/10 text-[#12D18E] hover:bg-[#12D18E] hover:text-[#06140F] font-bold rounded-xl px-4 transition-all"
            >
                Ứng tuyển ngay
            </Button>
            <Button 
              onClick={toggleBookmark}
              variant="outline" 
              size="icon" 
              className={`shrink-0 border-[#232B27] bg-[#161C19] rounded-xl h-9 w-9 transition-colors ${
                isBookmarked ? 'text-[#12D18E] border-[#12D18E]/50' : 'text-[#9FADA6] hover:text-white hover:border-[#3A4640]'
              }`}
            >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#12D18E]' : ''}`} />
            </Button>
        </div>
      </div>

    </div>
  );
}
