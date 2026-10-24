import React, { useState } from 'react';
import { X, Upload, Loader2, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SubmitMilestoneModalProps {
  milestone: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { notes: string; attachmentUrls: string[] }) => Promise<void>;
}

export default function SubmitMilestoneModal({ milestone, isOpen, onClose, onSubmit }: SubmitMilestoneModalProps) {
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !milestone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) {
      toast.error("Vui lòng cung cấp link sản phẩm đính kèm.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        notes,
        attachmentUrls: [link]
      });
      setNotes('');
      setLink('');
      onClose();
    } catch (error) {
      // Bỏ alert, vì Dashboard Home đã xử lý hiện toast.error ở hàm handleSubmitMilestone nếu lỗi truyền từ component cha.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-[#161616]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#12D18E]" />
            Nộp Sản Phẩm
          </h2>
          <button 
            onClick={onClose}
            className="text-[#64748B] hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-[#94A3B8] font-medium uppercase tracking-wider">Giai đoạn nghiệm thu</p>
            <p className="text-white font-bold">{milestone.title}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-[#94A3B8]" /> Link đính kèm sản phẩm <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://figma.com/file/... hoặc Google Drive link"
                className="w-full bg-[#161616] border-0 focus:ring-0 focus:outline-none outline-none text-white rounded-xl px-4 py-3 text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#94A3B8]" /> Ghi chú cho khách hàng
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mô tả qua về phần công việc bạn đã hoàn thành..."
                className="w-full bg-[#161616] border-0 focus:ring-0 focus:outline-none outline-none text-white rounded-xl px-4 py-3 text-sm min-h-[100px] transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button 
              type="button" 
              onClick={onClose} 
              variant="ghost" 
              className="flex-1 bg-[#161616] text-white hover:bg-[#222222]"
            >
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-[#12D18E] hover:bg-[#0EAE75] text-black font-bold"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang gửi...</>
              ) : (
                "Xác nhận nộp"
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
