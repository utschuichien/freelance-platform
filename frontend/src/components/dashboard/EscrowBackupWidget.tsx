import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface EscrowBackupWidgetProps {
  availableBalance: number;
  escrowBalance: number;
}

export default function EscrowBackupWidget({ availableBalance, escrowBalance }: EscrowBackupWidgetProps) {
  return (
    <div className="p-6 rounded-2xl glass-card space-y-6">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <h3 className="font-bold text-white text-sm">Quỹ Escrow Tích Lũy</h3>
        <span className="text-xs text-[#12D18E]">2026</span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        {/* Donut Progress Ring */}
        <div className="relative w-36 h-36 rounded-full border-8 border-blue-600/20 flex items-center justify-center border-t-[#12D18E] border-r-blue-500 glow-mint-sm">
          <div className="text-center">
            <span className="text-lg font-black text-white block">{formatCurrency(availableBalance)}</span>
          </div>
        </div>

        <div className="w-full space-y-2 text-xs pt-2">
          <div className="flex justify-between text-[#94A3B8]">
            <span>Ký quỹ tạm khóa</span>
            <strong className="text-amber-400">{formatCurrency(escrowBalance)}</strong>
          </div>
          <Progress value={75} />
        </div>
      </div>
    </div>
  );
}
