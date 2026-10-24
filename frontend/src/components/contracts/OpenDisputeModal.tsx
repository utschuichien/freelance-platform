"use client";

import { useState } from "react";
import { Loader2, X, ShieldAlert, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OpenDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractTitle: string;
  onSubmit: (data: { reason: string; evidenceUrls?: string[] }) => void;
  isLoading?: boolean;
}

export default function OpenDisputeModal({
  isOpen,
  onClose,
  contractTitle,
  onSubmit,
  isLoading = false,
}: OpenDisputeModalProps) {
  const [reason, setReason] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([""]);

  if (!isOpen) return null;

  const handleAddUrl = () => {
    setEvidenceUrls([...evidenceUrls, ""]);
  };

  const handleUrlChange = (index: number, value: string) => {
    const updated = [...evidenceUrls];
    updated[index] = value;
    setEvidenceUrls(updated);
  };

  const handleRemoveUrl = (index: number) => {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const filteredUrls = evidenceUrls.map((u) => u.trim()).filter(Boolean);
    onSubmit({
      reason: reason.trim(),
      evidenceUrls: filteredUrls.length > 0 ? filteredUrls : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl w-full max-w-lg text-white space-y-4">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Mở Khiếu nại & Tranh chấp</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200/90 leading-relaxed">
          <strong>Lưu ý:</strong> Khi mở khiếu nại, trạng thái hợp đồng sẽ chuyển sang <strong>DISPUTED</strong>. Số tiền ký quỹ của hợp đồng sẽ tạm thời đóng băng cho đến khi Ban quản trị hoàn tất phân xử.
        </div>

        <p className="text-xs text-[#94A3B8]">
          Hợp đồng: <span className="text-white font-semibold">{contractTitle}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
              Lý do khiếu nại chi tiết <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả cụ thể vấn đề phát sinh, vi phạm thỏa thuận hoặc bất đồng giữa hai bên..."
              className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">
                Link bằng chứng đính kèm (Google Drive, ảnh chụp màn hình, Github...)
              </label>
              <button
                type="button"
                onClick={handleAddUrl}
                className="text-[11px] font-semibold text-[#12D18E] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm link
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {evidenceUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(idx, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-[#111111] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  {evidenceUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(idx)}
                      className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#222222]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-[#333] text-zinc-300">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Gửi đơn khiếu nại
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

