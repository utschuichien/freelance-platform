import { useState, useEffect } from "react";
import { X, Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "DEPOSIT" | "WITHDRAW";
  availableBalance: number;
  onSubmit: (amount: number) => void;
  isPending: boolean;
}

export default function TransactionModal({ isOpen, onClose, type, availableBalance, onSubmit, isPending }: TransactionModalProps) {
  const [amountStr, setAmountStr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmountStr("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amount = Number(amountStr.replace(/\./g, ""));
    
    if (isNaN(amount) || amount <= 0) {
      setError("Số tiền không hợp lệ.");
      return;
    }

    if (type === "WITHDRAW" && amount > availableBalance) {
      setError("Số dư không đủ để rút.");
      return;
    }

    if (amount > 1000000000) {
      setError("Số tiền quá lớn cho một lần giao dịch.");
      return;
    }

    onSubmit(amount);
  };

  const isDeposit = type === "DEPOSIT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeposit ? 'bg-[#12D18E]/10 text-[#12D18E]' : 'bg-red-500/10 text-red-500'}`}>
              {isDeposit ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{isDeposit ? 'Nạp Tiền Giả Lập' : 'Rút Tiền Giả Lập'}</h3>
              <p className="text-[12px] text-[#94A3B8]">Môi trường thử nghiệm (Mock)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors p-1 rounded-full hover:bg-[#222222]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Số tiền (VNĐ)</label>
              <span className="text-[12px] text-[#12D18E]">Khả dụng: {new Intl.NumberFormat('vi-VN').format(availableBalance)} ₫</span>
            </div>
            <div className="relative">
              <input 
                type="text" 
                autoFocus
                value={amountStr}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  setAmountStr(rawValue ? new Intl.NumberFormat('vi-VN').format(Number(rawValue)) : "");
                }}
                placeholder="Ví dụ: 5.000.000" 
                className={`w-full p-4 rounded-xl bg-[#161616] border ${error ? 'border-red-500' : 'border-[#222222] focus:border-[#12D18E]'} text-white text-sm font-bold outline-none transition-colors`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] text-sm font-bold">VNĐ</span>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <div className="bg-[#1C1C1C] rounded-lg p-4 text-xs text-[#94A3B8] border border-[#222222]">
            {isDeposit ? (
              <span>Số tiền này sẽ được cộng trực tiếp vào <b>Ví Khả Dụng</b> của bạn để thanh toán các hợp đồng Escrow.</span>
            ) : (
              <span>Số tiền rút sẽ được trừ khỏi <b>Ví Khả Dụng</b> và giả lập chuyển về tài khoản ngân hàng của bạn.</span>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 bg-[#161616] hover:bg-[#1E1E1E] text-[#94A3B8] hover:text-white border-none"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className={`flex-1 font-bold ${isDeposit ? 'bg-[#12D18E] text-black hover:bg-[#0EAE75]' : 'bg-red-500 text-white hover:bg-red-600'}`}
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isDeposit ? 'Xác nhận Nạp' : 'Xác nhận Rút'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
