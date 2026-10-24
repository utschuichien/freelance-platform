"use client";

import { useState } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, Check, X, Search } from "lucide-react";
import { useAdminFinanceStats, useAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/api/useAdminFinance";
import Pagination from "@/components/admin/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminFinancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const { data: stats } = useAdminFinanceStats();
  const { data, isLoading: loading } = useAdminWithdrawals(currentPage);
  const withdrawals = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const itemsPerPage = data?.limit || 8;
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

  const handleApprove = (id: string) => {
    if (window.confirm("Xác nhận đã chuyển khoản qua ngân hàng thành công? Hành động này sẽ trừ số dư của Freelancer trên hệ thống.")) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = window.prompt("Nhập lý do từ chối (tiền sẽ được hoàn lại vào ví Khả dụng của Freelancer):");
    if (reason !== null) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Rút tiền & Tài chính</h1>
        <p className="text-[#86868B] mt-1 text-[13px] font-medium">Quản lý giao dịch nạp/rút và tiền ký quỹ Escrow toàn hệ thống.</p>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[140px] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#34C759]">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-[#86868B] text-[12px] font-semibold tracking-wide">Tổng Quỹ Escrow</h3>
          </div>
          <p className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">
            {stats ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalEscrow) : '...'}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[140px] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#0071E3]">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <h3 className="text-[#86868B] text-[12px] font-semibold tracking-wide">Doanh thu Phí (10%)</h3>
          </div>
          <p className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">
            {stats ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalFees) : '...'}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[140px] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-[#FF3B30]">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="text-[#86868B] text-[12px] font-semibold tracking-wide">Lệnh Rút Chờ Duyệt</h3>
          </div>
          <p className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">{stats?.pendingWithdrawals ?? '...'}</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col mt-8">
        
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-xl">
          <h3 className="font-semibold text-[#1D1D1F] text-base">Danh sách Yêu cầu Rút Tiền</h3>
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-[#86868B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm mã giao dịch..." 
              className="w-64 pl-10 pr-4 py-2 bg-[#F5F5F7] border border-transparent rounded-full text-[13px] outline-none focus:bg-white focus:border-[#0071E3]/30 focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-[#1D1D1F] placeholder-[#86868B] font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F7]/50 text-[11px] uppercase tracking-wider text-[#86868B] font-semibold border-b border-black/5">
                <th className="px-6 py-4">Mã GD</th>
                <th className="px-6 py-4">Người yêu cầu</th>
                <th className="px-6 py-4">Số tiền rút</th>
                <th className="px-6 py-4">Ngân hàng đích</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#86868B] font-medium">Đang tải dữ liệu...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#86868B] font-medium">Không có yêu cầu rút tiền nào.</td></tr>
              ) : withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-black/[0.02] transition-colors group cursor-pointer">
                  <td className="px-6 py-4 text-[13px] font-mono text-[#86868B]">#{w.id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-semibold text-[#1D1D1F]">{w.userName || 'Unknown'}</p>
                    <p className="text-[12px] text-[#86868B] mt-0.5">{new Date(w.createdAt).toLocaleString('vi-VN')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[15px] font-bold text-[#FF3B30]">
                      - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(w.amount)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-semibold text-[#1D1D1F]">{w.bankInfo?.bankName || 'N/A'}</p>
                    <p className="text-[12px] text-[#86868B] font-mono">{w.bankInfo?.accountNumber} ({w.bankInfo?.accountName})</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {w.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleReject(w.id)} className="w-8 h-8 rounded-full bg-red-50 text-[#FF3B30] hover:bg-red-100 flex items-center justify-center transition-colors" title="Từ chối">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleApprove(w.id)} className="px-4 py-1.5 rounded-full bg-[#34C759] text-white font-semibold text-[12px] hover:bg-[#2EB04F] transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(52,199,89,0.3)]">
                          <Check className="w-3 h-3" /> Duyệt & Chuyển tiền
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${w.status === 'APPROVED' ? 'bg-green-50 text-[#34C759]' : 'bg-red-50 text-[#FF3B30]'}`}>
                        {w.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}
