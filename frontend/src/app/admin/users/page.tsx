"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Search, Filter, ShieldCheck, Ban, MoreVertical, CheckCircle2, XCircle, ChevronDown, Loader2 } from "lucide-react";
import { useAdminUsers, useUpdateKycStatus, useUpdateUserStatus } from "@/hooks/api/useAdminUsers";
import Pagination from "@/components/admin/Pagination";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const roleParam = searchParams.get('role') || undefined;
  const searchParam = searchParams.get('search') || undefined;
  const statusParam = searchParams.get('status') || undefined;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  
  const [searchInput, setSearchInput] = useState(searchParam || "");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    isActive: boolean;
  }>({ isOpen: false, userId: '', userName: '', isActive: false });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ROLES = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'FREELANCER', label: 'Freelancer' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  const { data, isLoading: loading } = useAdminUsers(currentPage, roleParam, searchParam, statusParam);
  const users = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const itemsPerPage = data?.limit || 8;

  const updateKycMutation = useUpdateKycStatus();
  const updateUserStatusMutation = useUpdateUserStatus();

  const handleKycStatus = (userId: string, status: string) => {
    updateKycMutation.mutate({ userId, status });
  };

  const handleUserStatus = (userId: string, isActive: boolean, userName: string) => {
    setConfirmModal({ isOpen: true, userId, userName, isActive });
  };

  const confirmAction = () => {
    const { userId, isActive, userName } = confirmModal;
    const actionText = isActive ? "mở khóa" : "khóa";
    
    updateUserStatusMutation.mutate(
      { userId, isActive },
      {
        onSuccess: () => {
          toast.success(`Đã ${actionText} tài khoản thành công!`);
          setConfirmModal({ ...confirmModal, isOpen: false });
        },
        onError: () => {
          toast.error(`Đã xảy ra lỗi khi ${actionText} tài khoản.`);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    );
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // native select removed

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`?${params.toString()}`);
  };

  const activeStatusClass = "px-4 py-1.5 rounded-full bg-[#0071E3] text-white text-[12px] font-medium cursor-pointer transition-all";
  const inactiveStatusClass = "px-4 py-1.5 rounded-full bg-transparent border border-transparent text-[#515154] hover:text-[#1D1D1F] hover:bg-black/5 text-[12px] font-medium cursor-pointer transition-all";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">Người dùng & KYC</h1>
          <p className="text-[#86868B] mt-1 text-xs sm:text-[13px] font-medium">Quản lý tài khoản, phân quyền và phê duyệt danh tính (KYC).</p>
        </div>
        <div className="flex gap-2">
          <div className="relative" ref={roleDropdownRef}>
            <button 
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              className={`pl-3.5 pr-3 py-2 bg-white border rounded-2xl text-[13px] font-semibold text-[#515154] flex items-center justify-between gap-3 cursor-pointer hover:border-black/10 hover:shadow-sm transition-all min-w-[140px] ${isRoleOpen ? 'border-black/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'border-black/5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]'}`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#86868B]" />
                {ROLES.find(r => r.value === (roleParam || ''))?.label || 'Tất cả vai trò'}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${isRoleOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isRoleOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[150px] bg-white/90 backdrop-blur-xl border border-black/5 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                {ROLES.map(role => {
                  const isActive = roleParam === role.value || (!roleParam && !role.value);
                  return (
                    <button
                      key={role.value}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', '1');
                        if (role.value) params.set('role', role.value);
                        else params.delete('role');
                        router.push(`?${params.toString()}`);
                        setIsRoleOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-between ${isActive ? 'text-[#0071E3] bg-[#0071E3]/5 hover:bg-[#0071E3]/10' : 'text-[#515154] hover:bg-black/5 hover:text-[#1D1D1F]'}`}
                    >
                      {role.label}
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col mt-8">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl">
          <div className="relative w-full md:w-auto">
            <Search className="w-4 h-4 text-[#86868B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full md:w-80 pl-10 pr-4 py-2 bg-[#F5F5F7] border border-transparent rounded-full text-[13px] outline-none focus:bg-white focus:border-[#0071E3]/30 focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-[#1D1D1F] placeholder-[#86868B] font-medium"
            />
            {searchInput && (
              <button 
                onClick={() => { setSearchInput(''); setTimeout(() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('search'); params.set('page', '1'); router.push(`?${params.toString()}`);
                }, 0)}}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span onClick={() => handleStatusChange('all')} className={!statusParam ? activeStatusClass : inactiveStatusClass}>
              Tất cả {!statusParam ? `(${totalItems})` : ''}
            </span>
            <span onClick={() => handleStatusChange('pending_kyc')} className={statusParam === 'pending_kyc' ? activeStatusClass : inactiveStatusClass}>
              Chờ KYC {statusParam === 'pending_kyc' ? `(${totalItems})` : ''}
            </span>
            <span onClick={() => handleStatusChange('blocked')} className={statusParam === 'blocked' ? activeStatusClass : inactiveStatusClass}>
              Bị khóa {statusParam === 'blocked' ? `(${totalItems})` : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="p-0 flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F7]/50 text-[11px] uppercase tracking-wider text-[#86868B] font-semibold border-b border-black/5">
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4">Trạng thái KYC</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#86868B] font-medium">Đang tải dữ liệu...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#86868B] font-medium">Chưa có người dùng nào.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-black/[0.02] transition-colors group cursor-pointer">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] border border-black/5 flex-shrink-0 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#86868B]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                        {user.fullName}
                        {user.kycStatus === 'VERIFIED' && <ShieldCheck className="w-4 h-4 text-[#0071E3]" />}
                        {!user.isActive && <Ban className="w-4 h-4 text-[#FF3B30]" />}
                      </p>
                      <p className="text-[12px] text-[#86868B] mt-0.5">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${user.role === 'FREELANCER' ? 'bg-[#5E5CE6]/10 text-[#5E5CE6]' : user.role === 'ADMIN' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#34C759]/10 text-[#34C759]'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#515154] font-medium">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    {user.kycStatus === 'PENDING' ? (
                      <span className="px-3 py-1 rounded-full bg-[#FF9F0A]/10 text-[#FF9F0A] text-[11px] font-semibold">Chờ duyệt</span>
                    ) : user.kycStatus === 'VERIFIED' ? (
                      <span className="px-3 py-1 rounded-full bg-black/5 text-[#515154] text-[11px] font-semibold">Đã xác minh</span>
                    ) : user.kycStatus === 'REJECTED' ? (
                      <span className="px-3 py-1 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-[11px] font-semibold">Bị từ chối</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-black/5 text-[#86868B] text-[11px] font-semibold">Chưa KYC</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {user.kycStatus === 'PENDING' && (
                        <>
                          <button onClick={() => handleKycStatus(user.id, 'VERIFIED')} className="p-2 bg-[#34C759]/10 text-[#34C759] rounded-full hover:bg-[#34C759]/20 transition-colors" title="Duyệt KYC">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleKycStatus(user.id, 'REJECTED')} className="p-2 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full hover:bg-[#FF3B30]/20 transition-colors" title="Từ chối KYC">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleUserStatus(user.id, !user.isActive, user.fullName)} className={`p-2 rounded-full transition-colors ${user.isActive ? 'bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20' : 'bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/20'}`} title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}>
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={`Xác nhận ${confirmModal.isActive ? "Mở khóa" : "Khóa"}`}
        description={
          <>
            Bạn có chắc chắn muốn {confirmModal.isActive ? "mở khóa" : "khóa"} tài khoản của <strong className="text-[#1D1D1F]">{confirmModal.userName}</strong> không?
            {!confirmModal.isActive && " Người dùng này sẽ bị đăng xuất và không thể đăng nhập vào hệ thống nữa."}
          </>
        }
        confirmText="Xác nhận"
        cancelText="Hủy bỏ"
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        isLoading={updateUserStatusMutation.isPending}
        isDestructive={!confirmModal.isActive}
      />
    </div>
  );
}
