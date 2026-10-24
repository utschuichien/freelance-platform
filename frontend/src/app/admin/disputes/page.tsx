"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Scale,
  DollarSign
} from "lucide-react";
import { useAdminDisputes, useResolveDispute, AdminDispute } from "@/hooks/api/useAdminDisputes";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminDisputesPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);

  // Resolution modal state
  const [resolutionType, setResolutionType] = useState<"REFUND_CLIENT" | "RELEASE_FREELANCER" | "SPLIT">("REFUND_CLIENT");
  const [adminNote, setAdminNote] = useState("");
  const [clientRefundAmount, setClientRefundAmount] = useState<number>(0);
  const [freelancerReleaseAmount, setFreelancerReleaseAmount] = useState<number>(0);

  const { data: disputes = [], isLoading } = useAdminDisputes(
    selectedStatus === "ALL" ? undefined : selectedStatus
  );
  const resolveMutation = useResolveDispute();

  const filteredDisputes = disputes.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.id.toLowerCase().includes(term) ||
      d.contractId.toLowerCase().includes(term) ||
      d.reason.toLowerCase().includes(term) ||
      d.initiatorName?.toLowerCase().includes(term) ||
      d.projectTitle?.toLowerCase().includes(term)
    );
  });

  const handleOpenResolveModal = (dispute: AdminDispute) => {
    setSelectedDispute(dispute);
    setResolutionType("REFUND_CLIENT");
    setAdminNote("");
    const totalAmount = Number(dispute.contract?.totalAmount) || 0;
    setClientRefundAmount(Math.round(totalAmount / 2));
    setFreelancerReleaseAmount(Math.round(totalAmount / 2));
  };

  const handleExecuteResolve = async () => {
    if (!selectedDispute) return;
    if (!adminNote.trim()) {
      toast.error("Vui lòng nhập lý do / ghi chú phán quyết của Admin");
      return;
    }

    try {
      await resolveMutation.mutateAsync({
        id: selectedDispute.id,
        resolution: resolutionType,
        adminNote,
        clientRefundAmount: resolutionType === "SPLIT" ? Number(clientRefundAmount) : undefined,
        freelancerReleaseAmount: resolutionType === "SPLIT" ? Number(freelancerReleaseAmount) : undefined,
      });

      toast.success("Đã ban hành phán quyết và thực thi luồng ký quỹ thành công!");
      setSelectedDispute(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xử lý phán quyết");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#0071E3]" />
            Quản lý Tranh chấp Hợp đồng
          </h1>
          <p className="text-sm text-[#86868B] mt-1">
            Tiếp nhận khiếu nại, đối soát bằng chứng giữa Khách hàng và Freelancer để phân xử ký quỹ.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/80 p-1.5 rounded-xl border border-black/5 shadow-sm">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "OPEN", label: "Chờ xử lý" },
            { id: "RESOLVED", label: "Đã giải quyết" },
            { id: "CANCELLED", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === tab.id
                  ? "bg-[#0071E3] text-white shadow-sm"
                  : "text-[#515154] hover:bg-black/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo mã khiếu nại, dự án, tên người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
        />
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#0071E3]" />
            <p className="text-sm">Đang tải danh sách khiếu nại...</p>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Không có khiếu nại nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Hiện tại không có tranh chấp hợp đồng nào cần phân xử trong danh mục này.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-slate-50/75 text-slate-500 font-medium">
                  <th className="py-3 px-4">Hợp đồng / Dự án</th>
                  <th className="py-3 px-4">Bên khiếu nại</th>
                  <th className="py-3 px-4">Lý do</th>
                  <th className="py-3 px-4">Số tiền ký quỹ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredDisputes.map((dispute) => {
                  const isPending = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";
                  return (
                    <tr key={dispute.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{dispute.projectTitle || "Hợp đồng dự án"}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">#{dispute.contractId.slice(0, 8)}...</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800">{dispute.initiatorName}</div>
                        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded mt-0.5 ${
                          dispute.initiatorRole === "CLIENT" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        }`}>
                          {dispute.initiatorRole === "CLIENT" ? "Khách hàng" : "Freelancer"}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{dispute.reason}</p>
                        {Array.isArray(dispute.evidenceUrls) && dispute.evidenceUrls.length > 0 && (
                          <span className="text-[11px] text-[#0071E3] font-medium mt-1 inline-flex items-center gap-1">
                            {dispute.evidenceUrls.length} tệp bằng chứng đính kèm
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {formatCurrency(Number(dispute.contract?.totalAmount || 0))}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          dispute.status === "OPEN" 
                            ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                            : dispute.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {dispute.status === "OPEN" && <AlertTriangle className="w-3 h-3" />}
                          {dispute.status === "RESOLVED" && <CheckCircle className="w-3 h-3" />}
                          {dispute.status === "OPEN" ? "Chờ phân xử" : dispute.status === "RESOLVED" ? "Đã phân xử" : dispute.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleOpenResolveModal(dispute)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0071E3] hover:bg-[#0071E3]/90 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            Phán quyết
                          </button>
                        ) : (
                          <div className="text-xs text-slate-500 font-medium">
                            {dispute.resolution === "REFUND_CLIENT" && "Hoàn tiền Client"}
                            {dispute.resolution === "RELEASE_FREELANCER" && "Giải ngân Freelancer"}
                            {dispute.resolution === "SPLIT" && "Phân chia thỏa thuận"}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-black/5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ban hành Phán quyết Tranh chấp</h3>
                  <p className="text-xs text-slate-500">Mã tranh chấp: #{selectedDispute.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Dispute Summary Details */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Dự án:</span>
                <span className="font-semibold text-slate-800">{selectedDispute.projectTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bên mở khiếu nại:</span>
                <span className="font-semibold text-slate-800">
                  {selectedDispute.initiatorName} ({selectedDispute.initiatorRole === "CLIENT" ? "Khách hàng" : "Freelancer"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng giá trị hợp đồng:</span>
                <span className="font-bold text-[#0071E3] text-sm">
                  {formatCurrency(Number(selectedDispute.contract?.totalAmount || 0))}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Nội dung khiếu nại:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed font-sans">
                  {selectedDispute.reason}
                </p>
              </div>

              {/* Bằng chứng đính kèm */}
              {Array.isArray(selectedDispute.evidenceUrls) && selectedDispute.evidenceUrls.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Tài liệu / Bằng chứng:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDispute.evidenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#0071E3] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-medium"
                      >
                        Bằng chứng #{idx + 1}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Phương án phân xử:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "REFUND_CLIENT",
                    title: "Hoàn tiền Client",
                    desc: "Hoàn toàn bộ tiền Escrow cho khách hàng",
                  },
                  {
                    id: "RELEASE_FREELANCER",
                    title: "Giải ngân Freelancer",
                    desc: "Thanh toán toàn bộ cho Freelancer",
                  },
                  {
                    id: "SPLIT",
                    title: "Phân chia tỷ lệ",
                    desc: "Chia theo thỏa thuận hòa giải",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setResolutionType(opt.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      resolutionType === opt.id
                        ? "border-[#0071E3] bg-[#0071E3]/5 text-[#0071E3] ring-2 ring-[#0071E3]/20"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.title}</div>
                    <div className="text-[10px] opacity-75 mt-1 leading-snug">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SPLIT Amount Inputs */}
            {resolutionType === "SPLIT" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Hoàn cho Khách hàng (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={clientRefundAmount}
                    onChange={(e) => setClientRefundAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Giải ngân cho Freelancer (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={freelancerReleaseAmount}
                    onChange={(e) => setFreelancerReleaseAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Admin Note Input */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                Lý do / Căn cứ phán quyết (Bắt buộc):
              </label>
              <textarea
                rows={3}
                placeholder="Nhập lý do phân xử, điều khoản hợp đồng áp dụng để thông báo cho hai bên..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteResolve}
                disabled={resolveMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0071E3] hover:bg-[#0071E3]/90 text-white shadow-sm disabled:opacity-50 transition-all"
              >
                {resolveMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang thực thi phán quyết...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Xác nhận & Thực thi ký quỹ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
