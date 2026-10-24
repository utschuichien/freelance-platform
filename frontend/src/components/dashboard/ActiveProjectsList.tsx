import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  budget: number;
  status: string;
  bids: number;
}

interface ActiveProjectsListProps {
  projects: Project[];
}

export default function ActiveProjectsList({ projects }: ActiveProjectsListProps) {
  return (
    <div className="p-6 rounded-2xl glass-card space-y-4">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <h3 className="font-bold text-white text-sm">Dự Án Đang Mở</h3>
        <span className="text-xs text-[#94A3B8]">{projects.length} dự án</span>
      </div>

      <div className="space-y-3 text-xs">
        {projects.map((p) => (
          <div key={p.id} className="p-3 rounded-xl bg-[#161616] border border-[#222222] space-y-1 hover:border-[#12D18E]/30 transition-colors">
            <p className="font-bold text-white truncate">{p.title}</p>
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
              <span className="text-[#12D18E] font-extrabold">{formatCurrency(p.budget)}</span>
              <span>{p.bids} Đề xuất</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
