import { ChevronDown, Lock, Upload, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: string;
  deadline: string;
  link?: string;
}

interface EscrowChartProps {
  milestones: Milestone[];
  handleFundEscrow: (mId: string, amt: number) => void;
  setActiveSubmitModalMilestone: (m: Milestone) => void;
  handleApproveMilestone: (mId: string, amt: number) => void;
}

export default function EscrowChart({
  milestones,
  handleFundEscrow,
  setActiveSubmitModalMilestone,
  handleApproveMilestone
}: EscrowChartProps) {
  // Dynamically calculate chart heights based on milestones
  const monthlyTotal = Array(12).fill(0);
  const monthlyPaid = Array(12).fill(0);
  let maxAmount = 0;

  milestones.forEach((m) => {
    if (m.deadline) {
      const date = new Date(m.deadline);
      const month = date.getMonth(); // 0 - 11
      if (!isNaN(month)) {
        monthlyTotal[month] += m.amount;
        if (m.status === 'PAID') {
          monthlyPaid[month] += m.amount;
        }
        if (monthlyTotal[month] > maxAmount) maxAmount = monthlyTotal[month];
      }
    }
  });

  const displayMaxAmount = maxAmount > 0 ? maxAmount : 1000000;

  return (
    <div className="p-6 rounded-2xl glass-card space-y-6">
      
      {/* Header of Chart Card */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-4">
        <div>
          <h2 className="text-base font-bold text-white">Dòng Tiền & Tiến Độ Escrow</h2>
          <p className="text-xs text-[#94A3B8]">Tổng quan luồng tiền & giải ngân theo giai đoạn</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#12D18E]">
              <span className="w-2 h-2 rounded-full bg-[#12D18E]"></span> Thu nhập
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> Chi tiêu
            </span>
          </div>

          <button className="px-3 py-1.5 rounded-xl bg-[#161616] border border-[#222222] text-xs text-[#94A3B8] flex items-center gap-1 hover:text-white transition-colors">
            Năm 2026 <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Chart Bars Visual */}
      <div className="flex gap-3">
        {/* Y-axis */}
        <div className="flex flex-col justify-between text-[10px] text-[#64748B] h-28 pb-2 pt-1 text-right whitespace-nowrap min-w-[50px]">
          <span>{formatCurrency(displayMaxAmount)}</span>
          <span>{formatCurrency(displayMaxAmount / 2)}</span>
          <span>0 ₫</span>
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 flex flex-col">
          <div className="h-28 flex items-end gap-3 px-2 border-b border-[#222222]/50 pb-2 justify-between">
            {monthlyTotal.map((total, i) => {
              const heightTotal = (total / displayMaxAmount) * 100;
              const heightPaid = (monthlyPaid[i] / displayMaxAmount) * 100;
              return (
                <div key={i} className="flex-1 flex items-end gap-1 h-full relative group">
                  <div
                    className="w-full bg-gradient-to-t from-[#12D18E]/20 to-[#12D18E] rounded-t-sm transition-all hover:brightness-125"
                    style={{ height: `${heightTotal}%` }}
                    title={`Tổng: ${formatCurrency(total)}`}
                  ></div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-sm opacity-60"
                    style={{ height: `${heightPaid}%` }}
                    title={`Đã giải ngân: ${formatCurrency(monthlyPaid[i])}`}
                  ></div>
                </div>
              );
            })}
          </div>
          
          {/* X-axis */}
          <div className="flex items-center justify-between px-2 pt-2">
            {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((month, i) => (
              <span key={i} className="text-[10px] text-[#64748B] flex-1 text-center">{month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Stepper Workspace */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
          Quy Trình Nghiệm Thu Hợp Đồng
        </h3>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div key={m.id} className="p-4 rounded-xl bg-[#161616] border border-[#222222] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Giai đoạn #{idx + 1}: {m.title}</span>
                <span className="font-extrabold text-[#12D18E]">{formatCurrency(m.amount)}</span>
              </div>

              {m.link && (
                <div className="text-[11px] text-[#94A3B8] font-mono">
                  Link sản phẩm: <a href={m.link} target="_blank" rel="noreferrer" className="text-[#12D18E] underline">{m.link}</a>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#222222]/50">
                <span className="text-[#64748B]">
                  Hạn chót: {m.deadline ? new Date(m.deadline).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </span>
                
                {m.status === "CREATED" && (
                  <Button onClick={() => handleFundEscrow(m.id, m.amount)} size="sm" variant="secondary" className="bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white">
                    <Lock className="w-3.5 h-3.5 mr-1" /> Nạp Escrow ({formatCurrency(m.amount)})
                  </Button>
                )}
                {m.status === "FUNDED" && (
                  <Button onClick={() => setActiveSubmitModalMilestone(m)} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                    <Upload className="w-3.5 h-3.5 mr-1" /> Nộp Sản Phẩm
                  </Button>
                )}
                {m.status === "SUBMITTED" && (
                  <Button onClick={() => handleApproveMilestone(m.id, m.amount)} size="sm" className="bg-[#12D18E] hover:bg-[#0EAE75] text-black">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Duyệt Nghiệm Thu & Giải Ngân
                  </Button>
                )}
                {m.status === "PAID" && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Đã Giải Ngân Thành Công
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
