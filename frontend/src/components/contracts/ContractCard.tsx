import { ShieldCheck, ChevronRight, Calendar, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export interface ContractCardData {
  id: string;
  title: string;
  client: string;
  totalAmount: number;
  amountPaid: number;
  deadline: string;
  status: string;
  progress: number;
}

interface ContractCardProps {
  contract: ContractCardData;
}

export default function ContractCard({ contract }: ContractCardProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-card space-y-4 hover:border-[#12D18E]/40 transition-all group">
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/contracts/${contract.id}`} className="hover:underline">
              <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#12D18E] transition-colors">
                {contract.title}
              </h3>
            </Link>
            {contract.status === "ACTIVE" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#12D18E]/20 text-[#12D18E] uppercase">
                Active
              </span>
            )}
            {contract.status === "COMPLETED" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">
                Completed
              </span>
            )}
            {contract.status === "DISPUTED" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                Disputed
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Khách hàng: <span className="text-white font-medium">{contract.client}</span>
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="block text-base sm:text-lg font-black text-[#12D18E]">
            {formatCurrency(contract.totalAmount)}
          </span>
          <span className="text-[10px] sm:text-xs text-[#64748B]">Tổng hợp đồng</span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs text-[#94A3B8]">
          <span>Tiến độ thanh toán & công việc</span>
          <strong className="text-white">{contract.progress}%</strong>
        </div>
        <Progress value={contract.progress} className="h-2" />
        <div className="flex flex-wrap justify-between gap-1 text-[11px] text-[#64748B]">
          <span>Đã giải ngân: <span className="text-white">{formatCurrency(contract.amountPaid)}</span></span>
          <span>Còn lại: <span className="text-white">{formatCurrency(contract.totalAmount - contract.amountPaid)}</span></span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-[#222222]/50 text-xs text-[#64748B]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Hạn chót: {contract.deadline}</span>
          <span className="flex items-center gap-1.5 text-blue-400"><ShieldCheck className="w-3.5 h-3.5" /> Escrow Bảo Đảm</span>
        </div>
        <Link href={`/contracts/${contract.id}`} className="w-full sm:w-auto">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-center text-[#12D18E] hover:bg-[#12D18E]/10 hover:text-[#12D18E]">
            Chi Tiết Hợp Đồng <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

    </div>
  );
}
