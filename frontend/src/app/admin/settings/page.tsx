"use client";

import { Settings, Save, Mail, Globe, Shield, Bell } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-[#86868B] mt-1 text-[13px] font-medium">Quản lý các tham số hoạt động chung của nền tảng FreelanceX.</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2 pb-3 border-b border-black/5">
          <Globe className="w-5 h-5 text-[#0071E3]" /> Cấu hình Cơ bản
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#86868B] mb-2">Email Hỗ trợ (Support)</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#86868B] absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                defaultValue="support@freelancex.vn"
                className="w-full pl-11 pr-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[16px] text-[14px] font-medium text-[#1D1D1F] outline-none focus:bg-white focus:border-[#0071E3]/30 focus:ring-4 focus:ring-[#0071E3]/10 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2 pb-3 border-b border-black/5">
          <Shield className="w-5 h-5 text-[#0071E3]" /> Bảo mật & Hoạt động
        </h2>

        <div className="space-y-4">
          
          {/* Toggle 1 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#1D1D1F]">Chế độ Bảo trì (Maintenance Mode)</p>
              <p className="text-[12px] text-[#86868B] mt-0.5">Tạm dừng toàn bộ hoạt động giao dịch trên nền tảng.</p>
            </div>
            <div 
              onClick={() => setMaintenance(!maintenance)}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out flex items-center ${maintenance ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${maintenance ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="h-[1px] w-full bg-black/5" />

          {/* Toggle 2 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#1D1D1F]">Tự động duyệt Dự án mới</p>
              <p className="text-[12px] text-[#86868B] mt-0.5">Dự án do Client đăng sẽ được public ngay lập tức.</p>
            </div>
            <div 
              onClick={() => setAutoApprove(!autoApprove)}
              className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out flex items-center ${autoApprove ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${autoApprove ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="pt-4 border-t border-black/5">
            <button className="px-5 cursor-pointer py-2.5 bg-[#0071E3] rounded-2xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 hover:bg-[#0077ED] transition-colors w-full sm:w-auto shadow-none !shadow-none">
              <Save className="w-[18px] h-[18px]" /> Lưu thay đổi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
