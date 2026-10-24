"use client";

import { useState } from "react";
import { Loader2, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetRole: string; // "Freelancer" | "Khách hàng"
  onSubmit: (rating: number, comment?: string) => void;
  isLoading?: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  targetName,
  targetRole,
  onSubmit,
  isLoading = false,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    onSubmit(rating, comment.trim() || undefined);
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return "Xuất sắc (5/5) 🌟";
      case 4:
        return "Rất tốt (4/5) 👍";
      case 3:
        return "Bình thường (3/5) 👌";
      case 2:
        return "Dưới kỳ vọng (2/5) ⚠️";
      case 1:
        return "Không hài lòng (1/5) ❌";
      default:
        return "";
    }
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161616] border border-[#262626] rounded-2xl p-6 shadow-2xl w-full max-w-lg text-white space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <Star className="w-5 h-5 fill-yellow-400" />
            <h3 className="text-lg font-bold text-white">Đánh giá & Nhận xét đối tác</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl p-3 text-xs text-[#94A3B8]">
          Đối tác được đánh giá:{" "}
          <span className="text-white font-bold">{targetName}</span> ({targetRole})
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating stars */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                          : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-yellow-400/90">
              {getRatingLabel(currentDisplayRating)}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
              Nhận xét về trải nghiệm hợp tác (Tùy chọn)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ về tính chuyên nghiệp, chất lượng công việc, giao tiếp và tiến độ hoàn thành..."
              className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || rating < 1}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Gửi đánh giá
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
