"use client";

import { useState } from "react";
import { Loader2, X, Send, Link as LinkIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneTitle: string;
  milestoneAmount: number | string;
  onSubmit: (data: { notes: string; attachmentUrls: string[] }) => void;
  isLoading?: boolean;
}

export default function SubmitMilestoneModal({
  isOpen,
  onClose,
  milestoneTitle,
  milestoneAmount,
  onSubmit,
  isLoading = false,
}: SubmitMilestoneModalProps) {
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    if (attachmentUrl.trim()) {
      setAttachments([...attachments, attachmentUrl.trim()]);
      setAttachmentUrl("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAttachments = [...attachments];
    if (attachmentUrl.trim()) {
      finalAttachments.push(attachmentUrl.trim());
    }
    onSubmit({
      notes: notes.trim(),
      attachmentUrls: finalAttachments,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#161616] border border-[#222222] rounded-2xl p-6 shadow-2xl w-full max-w-lg text-white space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Nộp sản phẩm hoàn thành</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Cột mốc: <span className="text-[#12D18E] font-medium">{milestoneTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
              Ghi chú / Mô tả kết quả bàn giao *
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả công việc bạn đã hoàn thành, tài liệu hướng dẫn hoặc lưu ý cho khách hàng..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#222222] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#12D18E] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
              Liên kết đính kèm (Github, Google Drive, Figma, v.v.)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#111111] border border-[#222222] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#12D18E] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddLink}
                className="bg-[#222222] border-[#333333] text-white hover:bg-[#333333] text-xs px-3"
              >
                Thêm link
              </Button>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#111111] border border-[#222222] text-xs text-[#94A3B8]"
                  >
                    <span className="truncate max-w-[340px] text-blue-400">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="text-[#64748B] hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#222222]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-[#111111] border-[#222222] text-[#94A3B8] hover:text-white"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !notes.trim()}
              className="bg-[#12D18E] text-black hover:bg-[#0EAE75] font-bold text-xs flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Nộp sản phẩm
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
