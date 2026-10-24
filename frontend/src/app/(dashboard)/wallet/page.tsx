"use client";

import { useState } from "react";
import { Wallet, Download, Upload, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import { formatCurrency } from "@/lib/utils";
import EscrowBackupWidget from "@/components/dashboard/EscrowBackupWidget";
import { useGetWallet, useDeposit, useWithdraw } from "@/hooks/api/useWallet";
import TransactionModal from "@/components/wallet/TransactionModal";

export default function WalletPage() {
  const { data: wallet, isLoading } = useGetWallet();
  const { mutate: deposit, isPending: isDepositing } = useDeposit();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();
  
  const [modalType, setModalType] = useState<"DEPOSIT" | "WITHDRAW" | null>(null);

  const availableBalance = wallet ? Number(wallet.availableBalance) : 0;
  const escrowBalance = wallet ? Number(wallet.escrowBalance) : 0;
  const transactions = wallet?.transactions || [];

  const handleTransactionSubmit = (amount: number) => {
    if (modalType === "DEPOSIT") {
      deposit({ amount }, {
        onSuccess: () => setModalType(null)
      });
    } else if (modalType === "WITHDRAW") {
      withdraw({ amount }, {
        onSuccess: () => setModalType(null)
      });
    }
  };

  return (
    <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Ví Escrow</h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">Quản lý dòng tiền, nạp/rút và trạng thái tiền bị khóa.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            onClick={() => setModalType("WITHDRAW")}
            className="flex-1 sm:flex-none bg-[#111111] border-none text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]"
          >
            <Download className="w-4 h-4 mr-2" /> Rút Tiền
          </Button>
          <Button 
            className="flex-1 sm:flex-none bg-[#12D18E] text-black hover:bg-[#0EAE75]" 
            onClick={() => setModalType("DEPOSIT")} 
          >
            <Upload className="w-4 h-4 mr-2" />
            Nạp Tiền
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1/3 width) - Balances */}
        <div className="space-y-6">
          {/* Main Balance Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C1C1C] to-[#0C0C0C] border border-[#222222] space-y-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-[#ffffff05]">
              <Wallet className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-1">
              <span className="text-sm text-[#94A3B8] font-medium">Số Dư Khả Dụng</span>
              <h2 className="text-3xl font-black text-white">{formatCurrency(availableBalance)}</h2>
            </div>
            <div className="relative z-10 flex gap-2">
              <Button size="sm" variant="ghost" className="w-full bg-[#161616] border-none hover:bg-[#1E1E1E] text-white">
                <CreditCard className="w-4 h-4 mr-2" /> Liên kết thẻ
              </Button>
            </div>
          </div>

          <EscrowBackupWidget availableBalance={availableBalance} escrowBalance={escrowBalance} />
        </div>

        {/* Right Column (2/3 width) - History */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-[#94A3B8] border border-dashed border-[#222222] rounded-2xl">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải lịch sử giao dịch...
            </div>
          ) : (
            <TransactionHistory transactions={transactions} />
          )}
        </div>

      </div>

      <TransactionModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType || "DEPOSIT"}
        availableBalance={availableBalance}
        onSubmit={handleTransactionSubmit}
        isPending={isDepositing || isWithdrawing}
      />

    </main>
  );
}
