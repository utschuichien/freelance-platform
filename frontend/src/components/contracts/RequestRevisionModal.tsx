"use client";

import { useState } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneTitle: string;
  onSubmit: (feedbackNotes: string) => void;
  isLoading?: boolean;
}

export default function RequestRevisionModal({
  isOpen,
  onClose,
  milestoneTitle,
  onSubmit,
  isLoading = false,
}: RequestRevisionModalProps) {
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    onSubmit(feedback.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 shadow-2xl w-full max-w-lg text-white space-y-4">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Yêu cầu chỉnh sửa</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#94A3B8]">
          Cột mốc: <span className="text-white font-semibold">{milestoneTitle}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
              Lý do hoặc nội dung cần chỉnh sửa <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Mô tả cụ thể những điểm cần sửa đổi hoặc hoàn thiện thêm..."
              className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !feedback.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Gửi yêu cầu sửa đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
