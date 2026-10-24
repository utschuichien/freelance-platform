import { ArrowDownLeft, ArrowUpRight, Lock, Unlock, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/types";

interface TransactionHistoryProps {
  transactions: (Transaction | {
    id: string;
    type: string;
    amount: number | string;
    createdAt?: string | Date;
    date?: string;
    status: string;
    description?: string;
  })[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT": return <ArrowDownLeft className="w-4 h-4 text-[#12D18E]" />;
      case "WITHDRAWAL": return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case "ESCROW_LOCK": return <Lock className="w-4 h-4 text-amber-500" />;
      case "ESCROW_RELEASE": return <Unlock className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-[#94A3B8]" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "DEPOSIT": return "text-[#12D18E]";
      case "WITHDRAWAL": return "text-rose-500";
      case "ESCROW_LOCK": return "text-amber-500";
      case "ESCROW_RELEASE": return "text-blue-400";
      default: return "text-white";
    }
  };

  const getPrefix = (type: string) => {
    return (type === "DEPOSIT" || type === "ESCROW_RELEASE") ? "+" : "-";
  };

  return (
    <div className="p-6 rounded-2xl glass-card space-y-4">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <h3 className="font-bold text-white text-sm">Lịch Sử Giao Dịch</h3>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-[#94A3B8] border border-dashed border-[#222222] rounded-2xl">
            <Clock className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm text-white font-medium">Chưa có giao dịch nào</p>
            <p className="text-xs mt-1 text-center max-w-[250px]">
              Các giao dịch nạp, rút hoặc giải ngân Escrow sẽ được ghi nhận tại đây.
            </p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-[#222222] hover:border-[#12D18E]/20 transition-all gap-2">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center shrink-0">
                  {getIcon(tx.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">{tx.description || tx.type}</p>
                  <p className="text-[10px] sm:text-xs text-[#64748B]">{tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : ('date' in tx ? String(tx.date) : '')}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`block text-xs sm:text-sm font-black ${getColor(tx.type)}`}>
                  {getPrefix(tx.type)}{formatCurrency(Number(tx.amount))}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#64748B]">{tx.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
