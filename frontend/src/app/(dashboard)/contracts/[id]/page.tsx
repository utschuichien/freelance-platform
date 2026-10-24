"use client";

import { use, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  Lock,
  Star,
  MessageSquare,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  useGetContract,
  useSubmitMilestone,
  useApproveMilestone,
  useRequestRevision,
  useTerminateContract,
  useCreateReview,
  useGetContractDispute,
  useOpenDispute,
} from "@/hooks/api/useContracts";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import SubmitMilestoneModal from "@/components/contracts/SubmitMilestoneModal";
import RequestRevisionModal from "@/components/contracts/RequestRevisionModal";
import ReviewModal from "@/components/contracts/ReviewModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import OpenDisputeModal from "@/components/contracts/OpenDisputeModal";
import { ContractMilestone } from "@/types";

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const user = useAuthStore((state) => state.user);

  const { data: contract, isLoading, isError } = useGetContract(id);
  const { data: disputeData } = useGetContractDispute(id, contract?.status === "DISPUTED");
  const submitMilestoneMutation = useSubmitMilestone();
  const approveMilestoneMutation = useApproveMilestone();
  const requestRevisionMutation = useRequestRevision();
  const terminateContractMutation = useTerminateContract();
  const createReviewMutation = useCreateReview();
  const openDisputeMutation = useOpenDispute();

  const [submittingMilestone, setSubmittingMilestone] = useState<ContractMilestone | null>(null);
  const [requestingMilestone, setRequestingMilestone] = useState<ContractMilestone | null>(null);
  const [approvingMilestone, setApprovingMilestone] = useState<ContractMilestone | null>(null);
  const [isTerminatingModalOpen, setIsTerminatingModalOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px] text-[#94A3B8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#12D18E] mb-3" />
        <p className="text-sm">Đang tải thông tin hợp đồng...</p>
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px] text-[#94A3B8]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Không tìm thấy hợp đồng</h2>
        <p className="text-xs text-[#94A3B8] mb-4">Hợp đồng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link href="/contracts">
          <Button variant="outline" className="border-[#222222] text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </main>
    );
  }

  const isClient = user?.id === contract.clientId || user?.role === "CLIENT";
  const isFreelancer = user?.id === contract.freelancerId || user?.role === "FREELANCER";

  const totalAmount = Number(contract.totalAmount) || 0;
  const amountPaid = contract.amountPaid || 0;
  const amountLocked = contract.amountLocked || 0;
  const remaining = Math.max(0, totalAmount - amountPaid - amountLocked);
  const progress = contract.progress || 0;

  const handleApproveConfirm = () => {
    if (!approvingMilestone) return;

    approveMilestoneMutation.mutate(approvingMilestone.id, {
      onSuccess: () => {
        toast.success("Đã phê duyệt và giải ngân thành công!");
        setApprovingMilestone(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Không thể phê duyệt cột mốc này");
      },
    });
  };

  const handleSubmitMilestoneConfirm = (data: { notes: string; attachmentUrls: string[] }) => {
    if (!submittingMilestone) return;

    submitMilestoneMutation.mutate(
      {
        id: submittingMilestone.id,
        data: {
          notes: data.notes,
          attachmentUrls: data.attachmentUrls,
        },
      },
      {
        onSuccess: () => {
          toast.success("Nộp sản phẩm thành công! Khách hàng sẽ xem xét và phê duyệt.");
          setSubmittingMilestone(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi nộp sản phẩm");
        },
      }
    );
  };

  const handleRequestRevisionConfirm = (feedbackNotes: string) => {
    if (!requestingMilestone) return;

    requestRevisionMutation.mutate(
      {
        id: requestingMilestone.id,
        feedbackNotes,
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi yêu cầu chỉnh sửa cho Freelancer!");
          setRequestingMilestone(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Không thể gửi yêu cầu chỉnh sửa");
        },
      }
    );
  };

  const handleOpenDisputeConfirm = (data: { reason: string; evidenceUrls?: string[] }) => {
    openDisputeMutation.mutate(
      { contractId: id, data },
      {
        onSuccess: () => {
          toast.success("Đã mở khiếu nại thành công. Ban quản trị sẽ tiếp nhận xử lý.");
          setIsDisputeModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Không thể mở khiếu nại");
        },
      }
    );
  };

  const handleTerminateConfirm = () => {
    terminateContractMutation.mutate(
      {
        id: contract.id,
        reason: terminateReason.trim() || undefined,
      },
      {
        onSuccess: (data: any) => {
          toast.success(data?.message || "Đã hủy hợp đồng và hoàn tiền về ví thành công!");
          setIsTerminatingModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Không thể hủy hợp đồng này");
        },
      }
    );
  };

  const handleCreateReviewSubmit = (rating: number, comment?: string) => {
    createReviewMutation.mutate(
      {
        contractId: contract.id,
        rating,
        comment,
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi đánh giá thành công! Cảm ơn bạn.");
          setIsReviewModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Không thể gửi đánh giá");
        },
      }
    );
  };

  const reviews = contract.reviews || [];
  const myReview = reviews.find((r) => r.reviewerId === user?.id);
  const partnerReview = reviews.find((r) => r.reviewerId !== user?.id);
  const partnerName = isClient
    ? contract.freelancerName || "Freelancer"
    : contract.clientName || "Khách hàng";
  const partnerRoleLabel = isClient ? "Freelancer" : "Khách hàng";

  return (
    <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
      {/* Back Button */}
      <div>
        <Link
          href="/contracts"
          className="inline-flex items-center text-xs sm:text-sm text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Quản lý hợp đồng
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Escrow Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-[#222222] bg-[#161616]/80 space-y-4 sm:space-y-6">
            <div className="space-y-2 border-b border-[#222222] pb-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  {contract.title || "Hợp đồng dịch vụ"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    contract.status === "COMPLETED"
                      ? "bg-[#12D18E]/10 text-[#12D18E]"
                      : contract.status === "ACTIVE"
                      ? "bg-blue-500/10 text-blue-400"
                      : contract.status === "DISPUTED"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : contract.status === "TERMINATED"
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-[#222222] text-[#94A3B8]"
                  }`}
                >
                  {contract.status === "COMPLETED"
                    ? "Hoàn thành"
                    : contract.status === "ACTIVE"
                    ? "Đang thực hiện"
                    : contract.status === "DISPUTED"
                    ? "Đang tranh chấp"
                    : contract.status === "TERMINATED"
                    ? "Đã hủy"
                    : contract.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8] pt-1">
                <p>
                  Khách hàng: <span className="font-bold text-white">{contract.clientName || "Khách hàng"}</span>
                </p>
                <span>•</span>
                <p>
                  Freelancer: <span className="font-bold text-white">{contract.freelancerName || "Freelancer"}</span>
                </p>
                <span>•</span>
                <p>
                  Tạo ngày: <span className="text-white">{new Date(contract.createdAt).toLocaleDateString("vi-VN")}</span>
                </p>
              </div>
            </div>

            {/* Disputed banner */}
            {contract.status === "DISPUTED" && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    Hợp đồng đang có tranh chấp / khiếu nại
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Hợp đồng đang trong quá trình đối soát và phân xử của Ban quản trị. Toàn bộ các giao dịch ký quỹ liên quan tạm thời được đóng băng để bảo vệ quyền lợi của cả hai bên.
                  </p>
                  {disputeData?.reason && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-xs text-amber-200/90">
                      <span className="text-[#94A3B8] block text-[11px] mb-0.5 font-semibold">Lý do khiếu nại:</span>
                      {disputeData.reason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completion celebratory banner */}
            {contract.status === "COMPLETED" && (
              <div className="p-4 rounded-xl bg-[#12D18E]/10 border border-[#12D18E]/30 flex items-center gap-3.5 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full bg-[#12D18E]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#12D18E]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Hợp đồng đã hoàn thành xuất sắc!</h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Tất cả các cột mốc đã được nghiệm thu và giải ngân 100%. Cảm ơn sự hợp tác của hai bên!
                  </p>
                </div>
              </div>
            )}

            {/* Terminated banner */}
            {contract.status === "TERMINATED" && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3.5 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Hợp đồng đã bị hủy</h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Hợp đồng này đã bị hủy. Toàn bộ số tiền ký quỹ của các cột mốc chưa thực hiện đã được hoàn trả lại vào ví của Khách hàng.
                  </p>
                </div>
              </div>
            )}

            {/* Progress Section */}
            <div className="space-y-4 border-b border-[#222222] pb-6">
              <div className="flex justify-between text-sm text-[#94A3B8]">
                <span>Tiến độ thanh toán hợp đồng</span>
                <strong className="text-white">{progress}%</strong>
              </div>
              <Progress value={progress} className="h-2 bg-[#222222]" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-2 text-center">
                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
                  <span className="block text-[#94A3B8] text-[10px] uppercase font-bold mb-1">
                    Đã Giải Ngân
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#12D18E]">
                    {formatCurrency(amountPaid)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
                  <span className="block text-[#94A3B8] text-[10px] uppercase font-bold mb-1">
                    Đang Khóa (Escrow)
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-500">
                    {formatCurrency(amountLocked)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#222222]">
                  <span className="block text-[#94A3B8] text-[10px] uppercase font-bold mb-1">
                    Tổng Giá Trị
                  </span>
                  <span className="text-base sm:text-lg font-black text-white">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Danh sách Cột Mốc ({contract.milestones?.length || 0})
                </h3>
              </div>

              <div className="space-y-3">
                {contract.milestones?.map((m: any, idx: number) => {
                  const hasSubmissions = m.submissions && m.submissions.length > 0;
                  const latestSubmission = hasSubmissions ? m.submissions[0] : null;

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all ${
                        m.status === "PAID"
                          ? "bg-[#111111] border-[#222222] opacity-80"
                          : m.status === "SUBMITTED"
                          ? "bg-[#111111] border-amber-500/30"
                          : "bg-[#111111] border-[#222222]"
                      } space-y-3`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {m.status === "PAID" && (
                              <CheckCircle2 className="w-5 h-5 text-[#12D18E]" />
                            )}
                            {m.status === "APPROVED" && (
                              <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            )}
                            {m.status === "SUBMITTED" && (
                              <FileCheck className="w-5 h-5 text-amber-400" />
                            )}
                            {(m.status === "FUNDED" || m.status === "CREATED") && (
                              <CircleDashed className="w-5 h-5 text-[#64748B]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-[#64748B]">#{idx + 1}</span>
                              <h4 className="font-bold text-sm text-white">{m.title}</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] mt-1.5">
                              <span className="font-bold text-[#12D18E]">
                                {formatCurrency(Number(m.amount))}
                              </span>
                              <span>•</span>
                              <span>
                                {m.deadline
                                  ? `Hạn chót: ${new Date(m.deadline).toLocaleDateString("vi-VN")}`
                                  : "Không có thời hạn"}
                              </span>
                              <span>•</span>
                              <span
                                className={`font-semibold ${
                                  m.status === "PAID"
                                    ? "text-[#12D18E]"
                                    : m.status === "SUBMITTED"
                                    ? "text-amber-400"
                                    : m.status === "REVISION_REQUESTED"
                                    ? "text-rose-400"
                                    : m.status === "APPROVED"
                                    ? "text-blue-400"
                                    : "text-[#94A3B8]"
                                }`}
                              >
                                {m.status === "PAID"
                                  ? "Đã thanh toán"
                                  : m.status === "SUBMITTED"
                                  ? "Đã nộp bài (Chờ duyệt)"
                                  : m.status === "REVISION_REQUESTED"
                                  ? "Yêu cầu chỉnh sửa"
                                  : m.status === "APPROVED"
                                  ? "Đã duyệt"
                                  : "Đang thực hiện"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="shrink-0 flex flex-wrap items-center gap-2">
                          {/* Freelancer submit deliverable button */}
                          {isFreelancer && (m.status === "FUNDED" || m.status === "CREATED" || m.status === "REVISION_REQUESTED") && (
                            <Button
                              onClick={() => setSubmittingMilestone(m)}
                              size="sm"
                              className="bg-[#12D18E] text-black hover:bg-[#0EAE75] font-bold text-xs"
                            >
                              <Send className="w-3.5 h-3.5 mr-1.5" />
                              {m.status === "REVISION_REQUESTED" ? "Nộp lại sản phẩm" : "Nộp sản phẩm"}
                            </Button>
                          )}

                          {/* Client approve & request revision buttons */}
                          {isClient && m.status === "SUBMITTED" && (
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                onClick={() => setRequestingMilestone(m)}
                                disabled={requestRevisionMutation.isPending || approveMilestoneMutation.isPending}
                                variant="outline"
                                size="sm"
                                className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 font-bold text-xs"
                              >
                                Yêu cầu sửa đổi
                              </Button>
                              <Button
                                onClick={() => setApprovingMilestone(m)}
                                disabled={approveMilestoneMutation.isPending || requestRevisionMutation.isPending}
                                size="sm"
                                className="bg-[#12D18E] text-black hover:bg-[#0EAE75] font-bold text-xs"
                              >
                                {approveMilestoneMutation.isPending && approvingMilestone?.id === m.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Đang giải ngân...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Duyệt & Giải ngân
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {m.status === "PAID" && (
                            <span className="px-3 py-1 rounded bg-[#12D18E]/10 text-[#12D18E] text-xs font-bold">
                              Hoàn tất
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display Submission Information if exists */}
                      {latestSubmission && (
                        <div className="mt-3 p-3 rounded-lg bg-[#161616] border border-[#222222] text-xs space-y-2">
                          <div className="flex items-center justify-between text-[#94A3B8]">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-amber-400" /> Bản nộp mới nhất:
                            </span>
                            <span>{new Date(latestSubmission.submittedAt).toLocaleString("vi-VN")}</span>
                          </div>

                          {latestSubmission.notes && (
                            <p className="text-[#94A3B8] whitespace-pre-wrap">{latestSubmission.notes}</p>
                          )}

                          {latestSubmission.attachmentUrls &&
                            Array.isArray(latestSubmission.attachmentUrls) &&
                            latestSubmission.attachmentUrls.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {latestSubmission.attachmentUrls.map((url: string, linkIdx: number) => (
                                  <a
                                    key={linkIdx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#111111] hover:bg-[#222222] text-blue-400 border border-[#222222] transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="max-w-[200px] truncate">{url}</span>
                                  </a>
                                ))}
                              </div>
                            )}

                          {/* Client's Revision Feedback */}
                          {latestSubmission.feedback && (
                            <div className="mt-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                                <span>Phản hồi từ Khách hàng (Yêu cầu chỉnh sửa):</span>
                              </div>
                              <p className="text-xs text-[#E2E8F0] bg-black/30 p-2.5 rounded border border-white/5 whitespace-pre-wrap">
                                {latestSubmission.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Way Reviews & Feedback Section */}
            {contract.status === "COMPLETED" && (
              <div className="p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#18160E] to-[#141414] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#28251e] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        Đánh giá & Nhận xét 2 chiều
                        {myReview && partnerReview && (
                          <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Hoàn tất 2 chiều 🎉
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#94A3B8]">
                        Hợp đồng đã hoàn thành. Đánh giá giúp xây dựng điểm uy tín cho cả hai bên.
                      </p>
                    </div>
                  </div>

                  {!myReview && (
                    <Button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-lg shadow-yellow-500/20"
                    >
                      <Star className="w-4 h-4 mr-1.5 fill-black" />
                      Viết đánh giá đối tác
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card: Đánh giá của tôi */}
                  <div className="p-4 rounded-xl border border-[#262626] bg-[#161616] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                      <span className="text-xs font-semibold text-[#94A3B8]">
                        Đánh giá của bạn gửi cho {partnerRoleLabel}
                      </span>
                      {myReview ? (
                        <div className="flex items-center gap-1 text-yellow-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= myReview.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-white ml-1">
                            {myReview.rating}.0
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-medium">Chưa đánh giá</span>
                      )}
                    </div>

                    {myReview ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-white leading-relaxed italic bg-black/30 p-3 rounded-lg border border-white/5">
                          "{myReview.comment || "Không có lời nhận xét bổ sung."}"
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          Gửi ngày {new Date(myReview.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-2">
                        <p className="text-xs text-[#94A3B8]">
                          Bạn chưa để lại nhận xét cho {partnerName}.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsReviewModalOpen(true)}
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs font-semibold"
                        >
                          Đánh giá ngay
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Card: Đánh giá từ đối tác */}
                  <div className="p-4 rounded-xl border border-[#262626] bg-[#161616] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                      <span className="text-xs font-semibold text-[#94A3B8]">
                        Nhận xét từ {partnerName} ({partnerRoleLabel})
                      </span>
                      {partnerReview ? (
                        <div className="flex items-center gap-1 text-yellow-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= partnerReview.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-white ml-1">
                            {partnerReview.rating}.0
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-medium">Đang chờ đối tác</span>
                      )}
                    </div>

                    {partnerReview ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-white leading-relaxed italic bg-black/30 p-3 rounded-lg border border-white/5">
                          "{partnerReview.comment || "Không có lời nhận xét bổ sung."}"
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          Gửi ngày {new Date(partnerReview.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <p className="text-xs text-zinc-500">
                          {partnerName} chưa gửi đánh giá cho bạn.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Escrow Info & Safe Guarantee */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[#12D18E]/30 bg-gradient-to-br from-[#161616] to-[#0E1B15] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#222222] pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#12D18E]/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#12D18E]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Cơ Chế Bảo Vệ Escrow</h3>
                <p className="text-[11px] text-[#12D18E]">Thanh toán đảm bảo 100%</p>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Toàn bộ số tiền thầu được tạm giữ tại quỹ bảo đảm Escrow. Freelancer chỉ nhận thanh toán khi cột mốc được khách hàng nghiệm thu đạt chuẩn.
            </p>
            <div className="space-y-2 pt-2 border-t border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Lock className="w-3.5 h-3.5 text-[#12D18E]" />
                <span>Tiền cọc đã được khóa an toàn</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Calendar className="w-3.5 h-3.5 text-[#12D18E]" />
                <span>Tự động cập nhật số dư ví sau khi duyệt</span>
              </div>
            </div>
          </div>

          {contract.project && (
            <div className="p-6 rounded-2xl border border-[#222222] bg-[#161616] space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#64748B] tracking-wider">Dự án gốc</h4>
              <p className="text-sm font-bold text-white line-clamp-2">{contract.project.title}</p>
              <Link href={`/jobs/${contract.projectId}`}>
                <Button variant="outline" size="sm" className="w-full mt-2 bg-[#111111] border-[#222222] text-[#94A3B8] hover:text-white">
                  Xem chi tiết tin đăng <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* Client Terminate Contract Card */}
          {isClient && contract.status === "ACTIVE" && (
            <div className="p-5 rounded-2xl border border-rose-500/20 bg-[#161616] space-y-3">
              <h4 className="text-xs font-bold uppercase text-rose-400 tracking-wider">Thao tác hợp đồng</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Nếu không muốn tiếp tục hợp tác, bạn có thể hủy hợp đồng. Tiền cọc của các cột mốc chưa hoàn thành sẽ được hoàn về ví của bạn.
              </p>
              <Button
                onClick={() => setIsTerminatingModalOpen(true)}
                disabled={terminateContractMutation.isPending}
                variant="outline"
                size="sm"
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold text-xs"
              >
                Hủy hợp đồng & Hoàn tiền
              </Button>
            </div>
          )}

          {/* Dispute Action Card */}
          {contract.status === "ACTIVE" && (
            <div className="p-5 rounded-2xl border border-amber-500/20 bg-[#161616] space-y-3">
              <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Tranh chấp hợp đồng
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Nếu phát sinh bất đồng không thể tự giải quyết, bạn có thể yêu cầu Ban quản trị can thiệp và phân xử ký quỹ.
              </p>
              <Button
                onClick={() => setIsDisputeModalOpen(true)}
                variant="outline"
                size="sm"
                className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 font-bold text-xs"
              >
                Mở khiếu nại / Tranh chấp
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Deliverable Modal */}
      {submittingMilestone && (
        <SubmitMilestoneModal
          isOpen={!!submittingMilestone}
          onClose={() => setSubmittingMilestone(null)}
          milestoneTitle={submittingMilestone.title}
          milestoneAmount={submittingMilestone.amount}
          onSubmit={handleSubmitMilestoneConfirm}
          isLoading={submitMilestoneMutation.isPending}
        />
      )}

      {/* Request Revision Modal */}
      {requestingMilestone && (
        <RequestRevisionModal
          isOpen={!!requestingMilestone}
          onClose={() => setRequestingMilestone(null)}
          milestoneTitle={requestingMilestone.title}
          onSubmit={handleRequestRevisionConfirm}
          isLoading={requestRevisionMutation.isPending}
        />
      )}

      {/* Approve Milestone Confirm Modal */}
      {approvingMilestone && (
        <ConfirmModal
          isOpen={!!approvingMilestone}
          title="Phê duyệt & Giải ngân cột mốc"
          description={
            <>
              Bạn có chắc chắn muốn phê duyệt cột mốc{" "}
              <strong className="text-white font-semibold">"{approvingMilestone.title}"</strong> và giải ngân số tiền{" "}
              <strong className="text-[#12D18E] font-semibold">{formatCurrency(Number(approvingMilestone.amount))}</strong>{" "}
              cho Freelancer không? Thao tác này không thể hoàn tác.
            </>
          }
          confirmText="Duyệt & Giải ngân"
          cancelText="Hủy bỏ"
          onConfirm={handleApproveConfirm}
          onCancel={() => setApprovingMilestone(null)}
          isLoading={approveMilestoneMutation.isPending}
        />
      )}

      {/* Terminate Contract Confirm Modal */}
      {isTerminatingModalOpen && (
        <ConfirmModal
          isOpen={isTerminatingModalOpen}
          isDestructive={true}
          title="Xác nhận hủy hợp đồng"
          description={
            <div className="space-y-3">
              <p>
                Bạn có chắc chắn muốn hủy hợp đồng này? Số tiền cọc của các cột mốc chưa hoàn thành (
                <strong className="text-rose-400 font-semibold">
                  {formatCurrency(totalAmount - amountPaid)}
                </strong>
                ) sẽ được tự động hoàn trả lại vào ví khả dụng của bạn.
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Lý do hủy (không bắt buộc):
                </label>
                <input
                  type="text"
                  placeholder="Nhập lý do hủy hợp đồng..."
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          }
          confirmText="Xác nhận Hủy & Hoàn cọc"
          cancelText="Đóng"
          onConfirm={handleTerminateConfirm}
          onCancel={() => setIsTerminatingModalOpen(false)}
          isLoading={terminateContractMutation.isPending}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        targetName={partnerName}
        targetRole={partnerRoleLabel}
        onSubmit={handleCreateReviewSubmit}
        isLoading={createReviewMutation.isPending}
      />

      {/* Open Dispute Modal */}
      {isDisputeModalOpen && (
        <OpenDisputeModal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          contractTitle={contract.title || "Hợp đồng dự án"}
          onSubmit={handleOpenDisputeConfirm}
          isLoading={openDisputeMutation.isPending}
        />
      )}
    </main>
  );
}
