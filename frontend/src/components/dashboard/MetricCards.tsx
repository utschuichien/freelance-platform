import { ShieldCheck, Briefcase, FolderKanban, Flag, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MetricCardsProps {
  escrowBalance: number;
  stats?: {
    activeProjectsCount: number;
    activeContractsCount: number;
    milestonesCount: number;
    paidAmount: number;
    pendingProposals: number;
  };
}

export default function MetricCards({ escrowBalance, stats }: MetricCardsProps) {
  const metricCards = [
    { title: "Ví Escrow Phong Tỏa", value: formatCurrency(escrowBalance), icon: ShieldCheck, bg: "bg-[#12D18E]/10 text-[#12D18E] border-[#12D18E]/20" },
    { title: "Dự Án Hoạt Động", value: stats?.activeProjectsCount ?? 0, icon: Briefcase, bg: "bg-[#12D18E]/10 text-[#12D18E] border-[#12D18E]/20" },
    { title: "Hợp Đồng Đang Hoạt Động", value: stats?.activeContractsCount ?? 0, icon: FolderKanban, bg: "bg-[#12D18E]/10 text-[#12D18E] border-[#12D18E]/20" },
    { title: "Mốc Công Việc", value: stats?.milestonesCount ?? 0, icon: Flag, bg: "bg-[#12D18E]/10 text-[#12D18E] border-[#12D18E]/20" },
    { title: "Đã Giải Ngân", value: formatCurrency(stats?.paidAmount ?? 0), icon: CheckCircle2, bg: "bg-[#12D18E]/10 text-[#12D18E] border-[#12D18E]/20" },
    { title: "Đề Xuất Đang Chờ", value: stats?.pendingProposals ?? 0, icon: Clock, bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl glass-card space-y-3 flex flex-col justify-between glass-card-hover group"
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.bg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[#94A3B8] font-medium">{card.title}</p>
              <p className="text-xl font-extrabold text-white mt-0.5 group-hover:text-[#12D18E] transition-colors">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
