"use client";

import { 
  Users, 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  Briefcase,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/api/useAdminDashboard";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useAdminDashboard();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-slate-500 mt-1 text-xs">Theo dõi các chỉ số quan trọng của nền tảng hôm nay.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-1.5 h-[150px]">
          <div className="w-10 h-10 rounded-[14px] bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Tổng Người Dùng</h3>
          <p className="text-xl font-black text-slate-900 tracking-tight">{dashboard?.totalUsers || 0}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-1.5 h-[150px]">
          <div className="w-10 h-10 rounded-[14px] bg-purple-50 flex items-center justify-center text-purple-600 mb-1">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Dự án Hoạt Động</h3>
          <p className="text-xl font-black text-slate-900 tracking-tight">{dashboard?.activeProjects || 0}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-1.5 h-[150px]">
          <div className="w-10 h-10 rounded-[14px] bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Tổng Tiền Ký Quỹ</h3>
          <p className="text-xl font-black text-slate-900 tracking-tight">
            {dashboard ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dashboard.totalEscrow) : '0 ₫'}
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-1.5 h-[150px]">
          <div className="w-10 h-10 rounded-[14px] bg-rose-50 flex items-center justify-center text-rose-500 mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Lệnh Rút Chờ</h3>
          <p className="text-xl font-black text-slate-900 tracking-tight">{dashboard?.pendingWithdrawals || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Recent KYC Requests */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Freelancer chờ duyệt KYC</h3>
            <Link href="/admin/users" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2.5 py-1 rounded-full">Xem tất cả</Link>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                  <th className="px-5 py-3">Tên User</th>
                  <th className="px-5 py-3">Ngày đăng ký</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500 text-sm">Đang tải...</td></tr>
                ) : dashboard?.recentKycRequests.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500 text-sm">Không có KYC chờ duyệt.</td></tr>
                ) : dashboard?.recentKycRequests.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-100 transition-colors group cursor-pointer">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{user.fullName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600 font-medium">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">Chờ duyệt</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href="/admin/users" className="text-[12px] font-bold text-blue-600 hover:text-blue-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">Duyệt ngay</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Yêu cầu rút tiền gần đây</h3>
            <Link href="/admin/finance" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2.5 py-1 rounded-full">Xem tất cả</Link>
          </div>
          <div className="p-0 flex-1">
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500 text-sm">Đang tải...</div>
              ) : dashboard?.recentWithdrawals.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">Không có lệnh rút tiền nào gần đây.</div>
              ) : dashboard?.recentWithdrawals.map((w) => (
                <div key={w.id} className="p-5 flex items-center justify-between hover:bg-slate-100 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-[14px] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">Rút về {w.bankInfo?.bankName || 'Ngân hàng'}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Yêu cầu bởi: {w.userName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(w.amount)}
                    </p>
                    <Link href="/admin/finance" className="inline-block mt-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      Xử lý giao dịch
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
