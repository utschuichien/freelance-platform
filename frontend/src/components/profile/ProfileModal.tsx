"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useGetProfile, useUpdateProfile, useGetMyReviews } from "@/hooks/api/useProfile";
import { User, Briefcase, Settings, FolderKanban, CheckCircle2, Upload, Camera, Save, Lock, Trash2, X, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import UserAvatar from "@/components/ui/UserAvatar";

export default function ProfileModal() {
  const { user } = useAuthStore();
  const { isProfileModalOpen, setProfileModalOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState("personal");
  const [showPortfolioPopup, setShowPortfolioPopup] = useState(false);

  const { data: profile, isLoading } = useGetProfile(isProfileModalOpen && !!user);
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetMyReviews(isProfileModalOpen && !!user);
  const updateProfileMutation = useUpdateProfile();

  const { register: registerPersonal, handleSubmit: handlePersonalSubmit } = useForm();
  const { register: registerProf, handleSubmit: handleProfSubmit } = useForm();

  if (!isProfileModalOpen) return null;

  // Merge auth user with profile data
  const mergedUser = {
    ...user,
    role: user?.role || "FREELANCER", 
    fullName: profile?.fullName || user?.fullName || "Người dùng mới",
    avatar: user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : "U",
    bio: profile?.bio || "",
    location: profile?.location || "",
    hourlyRate: profile?.hourlyRate || 0,
    skills: profile?.skills ? profile.skills.join(", ") : "",
  };

  const onPersonalSubmit = (data: any) => {
    updateProfileMutation.mutate({
      fullName: data.fullName,
      location: data.location,
      bio: data.bio,
    });
  };

  const onProfSubmit = (data: any) => {
    updateProfileMutation.mutate({
      hourlyRate: Number(data.hourlyRate),
      skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0C0C0C] border border-[#222222] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 relative flex flex-col">
        
        {/* Close button */}
        <button 
          onClick={() => setProfileModalOpen(false)}
          className="absolute cursor-pointer top-4 right-4 z-10 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <main className="p-5 md:p-6 space-y-8 flex-1 w-full">
          {/* Header Profile Cover */}
          <div className="relative rounded-2xl overflow-hidden glass-card border border-[#222222]">
            <div className="h-32 bg-gradient-to-r from-[#12D18E]/20 to-blue-500/20"></div>
            <div className="px-5 md:px-6 pb-6 pt-0 flex flex-col md:flex-row md:items-end gap-6 relative -top-12">
              
              {/* Avatar */}
              <div className="relative group cursor-pointer">
                <UserAvatar seed={mergedUser.fullName} className="w-28 h-28 border-[#12D18E] border-2 shadow-[0_0_20px_rgba(18,209,142,0.3)]" />
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#111111] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-1 mb-2">
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  {mergedUser.fullName}
                </h1>
                <p className="text-sm font-medium text-[#12D18E]">
                  {mergedUser.role === 'FREELANCER' ? 'Freelancer Chuyên Nghiệp' : 'Khách Hàng (Client)'}
                </p>
                <p className="text-xs text-[#94A3B8]">Tham gia từ tháng 9, 2026</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            
            {/* Horizontal Tabs Navigation */}
            <div className="flex items-center gap-6 border-b border-[#222222] overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-2 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === "personal" ? "border-[#12D18E] text-[#12D18E]" : "border-transparent text-[#94A3B8] hover:text-white"}`}
              >
                <User className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Thông tin cá nhân</span>
              </button>
              
              {mergedUser.role === 'FREELANCER' && (
                <button 
                  onClick={() => setActiveTab("professional")}
                  className={`flex items-center gap-2 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === "professional" ? "border-[#12D18E] text-[#12D18E]" : "border-transparent text-[#94A3B8] hover:text-white"}`}
                >
                  <Briefcase className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Chuyên môn & Hồ sơ</span>
                </button>
              )}

              <button 
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-2 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === "projects" ? "border-[#12D18E] text-[#12D18E]" : "border-transparent text-[#94A3B8] hover:text-white"}`}
              >
                <FolderKanban className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">{mergedUser.role === 'CLIENT' ? 'Dự án đã đăng' : 'Dự án của tôi'}</span>
              </button>

              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === "settings" ? "border-[#12D18E] text-[#12D18E]" : "border-transparent text-[#94A3B8] hover:text-white"}`}
              >
                <Settings className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Cài đặt tài khoản</span>
              </button>

              <button 
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-2 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === "reviews" ? "border-amber-400 text-amber-400" : "border-transparent text-[#94A3B8] hover:text-white"}`}
              >
                <Star className="w-4 h-4 shrink-0 fill-amber-400/20 text-amber-400" />
                <span className="whitespace-nowrap">Đánh giá & Uy tín</span>
                {reviewsData && reviewsData.total > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold">
                    {reviewsData.total}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-w-0 relative">
              
              {isLoading ? (
                <div className="glass-card p-5 md:p-6 rounded-2xl border border-[#222222] min-h-[400px] space-y-6">
                  {/* Skeleton Header */}
                  <div className="border-b border-[#222222] pb-4 space-y-3">
                    <div className="h-6 w-48 bg-[#222222] rounded-md animate-pulse"></div>
                    <div className="h-3 w-64 bg-[#222222] rounded-md animate-pulse"></div>
                  </div>
                  {/* Skeleton Form */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-[#222222] rounded animate-pulse"></div>
                        <div className="h-11 w-full bg-[#111111] border border-[#222222] rounded-xl animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-[#222222] rounded animate-pulse"></div>
                        <div className="h-11 w-full bg-[#111111] border border-[#222222] rounded-xl animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-[#222222] rounded animate-pulse"></div>
                      <div className="h-11 w-full bg-[#111111] border border-[#222222] rounded-xl animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-[#222222] rounded animate-pulse"></div>
                      <div className="h-28 w-full bg-[#111111] border border-[#222222] rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-5 md:p-6 rounded-2xl border border-[#222222] min-h-[400px]">
                  
                  {/* PERSONAL INFO TAB */}
                  {activeTab === "personal" && (
                  <div className="space-y-6">
                    <div className="border-b border-[#222222] pb-4">
                      <h2 className="text-lg font-bold text-white">Thông tin cá nhân</h2>
                      <p className="text-[13px] text-[#94A3B8]">Cập nhật thông tin cơ bản để đối tác hiểu rõ hơn về bạn.</p>
                    </div>
                    
                    <form onSubmit={handlePersonalSubmit(onPersonalSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Họ và tên</label>
                          <input {...registerPersonal("fullName")} type="text" defaultValue={mergedUser.fullName} className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Email liên hệ</label>
                          <input type="email" defaultValue={mergedUser.email} disabled className="w-full p-3 rounded-xl bg-[#111111]/50 border border-[#222222] text-[#64748B] cursor-not-allowed text-[13px]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Khu vực / Thành phố</label>
                        <input {...registerPersonal("location")} type="text" defaultValue={mergedUser.location} placeholder="Ví dụ: Hà Nội, Việt Nam" className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Giới thiệu bản thân (Bio)</label>
                        <textarea {...registerPersonal("bio")} rows={4} defaultValue={mergedUser.bio} placeholder="Viết một đoạn ngắn giới thiệu về bản thân..." className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px] resize-none"></textarea>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button disabled={updateProfileMutation.isPending} type="submit" className="bg-[#12D18E] text-black hover:bg-[#0EAE75] font-bold rounded-xl px-6">
                          {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Thay Đổi
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* PROFESSIONAL INFO TAB */}
                {activeTab === "professional" && mergedUser.role === 'FREELANCER' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#222222] pb-4">
                      <h2 className="text-lg font-bold text-white">Chuyên môn & Hồ sơ</h2>
                      <p className="text-[13px] text-[#94A3B8]">Giúp khách hàng dễ dàng tìm thấy bạn qua các kỹ năng nổi bật.</p>
                    </div>

                    <form onSubmit={handleProfSubmit(onProfSubmit)} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Mức lương mong muốn / Giờ (VNĐ)</label>
                        <input {...registerProf("hourlyRate")} type="number" defaultValue={mergedUser.hourlyRate} className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Kỹ năng nổi bật (Cách nhau bằng dấu phẩy)</label>
                        <input {...registerProf("skills")} type="text" defaultValue={mergedUser.skills} placeholder="Ví dụ: React, UI Design, Marketing" className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                      </div>

                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Dự án tiêu biểu (Portfolio)</label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button" 
                            onClick={() => setShowPortfolioPopup(true)}
                            className="h-8 border-[#12D18E] text-[#12D18E] bg-[#12D18E]/5 hover:bg-[#12D18E]/10 text-xs"
                          >
                            + Thêm dự án
                          </Button>
                        </div>
                        <div className="border border-dashed border-[#222222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                          <Upload className="w-8 h-8 text-[#64748B] mb-3" />
                          <p className="text-[13px] text-white font-bold">Chưa có dự án nào</p>
                          <p className="text-[11px] text-[#94A3B8] mt-1">Hãy thêm các dự án tốt nhất của bạn để ghi điểm với khách hàng</p>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button disabled={updateProfileMutation.isPending} type="submit" className="bg-[#12D18E] text-black hover:bg-[#0EAE75] font-bold rounded-xl px-6">
                          {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu Hồ Sơ
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* PROJECTS TAB */}
                {activeTab === "projects" && (
                  <div className="space-y-6">
                    <div className="border-b border-[#222222] pb-4">
                      <h2 className="text-lg font-bold text-white">Quản lý dự án</h2>
                      <p className="text-[13px] text-[#94A3B8]">Theo dõi các công việc bạn đang tham gia hoặc đã hoàn thành.</p>
                    </div>
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <FolderKanban className="w-12 h-12 text-[#222222] mb-4" />
                      <p className="text-[13px] text-white font-bold">Không có dữ liệu</p>
                      <p className="text-[12px] text-[#94A3B8] mt-2 max-w-sm">
                        Khu vực này sẽ hiển thị các dự án thực tế khi được liên kết trực tiếp với Database ở bước sau.
                      </p>
                    </div>
                  </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div className="border-b border-[#222222] pb-4">
                      <h2 className="text-lg font-bold text-white">Bảo mật & Cài đặt</h2>
                      <p className="text-[13px] text-[#94A3B8]">Quản lý mật khẩu và quyền truy cập tài khoản.</p>
                    </div>

                    <div className="space-y-6">
                      {/* Password Change */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-[#12D18E]" /> Đổi mật khẩu</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Mật khẩu mới</label>
                            <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                            <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                          </div>
                        </div>
                        <Button size="sm" className="bg-[#161616] border border-[#222222] text-white hover:bg-[#222222]">Cập nhật mật khẩu</Button>
                      </div>

                      {/* Danger Zone */}
                      <div className="pt-8 mt-8 border-t border-[#222222]">
                        <h3 className="text-sm font-bold text-red-500 mb-2">Xóa tài khoản</h3>
                        <p className="text-[12px] text-[#94A3B8] mb-4">Sau khi xóa tài khoản, tất cả dữ liệu của bạn sẽ không thể khôi phục.</p>
                        <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 font-bold">
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa Tài Khoản Vĩnh Viễn
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* REVIEWS & REPUTATION TAB */}
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                          Đánh giá từ đối tác
                        </h2>
                        <p className="text-[13px] text-[#94A3B8]">
                          Tổng hợp phản hồi và điểm tín nhiệm từ các hợp đồng bạn đã hoàn tất.
                        </p>
                      </div>

                      {reviewsData && reviewsData.total > 0 && (
                        <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-xl">
                          <div className="text-right">
                            <div className="text-lg font-extrabold text-amber-400">
                              {reviewsData.avgRating} / 5.0
                            </div>
                            <div className="text-[10px] text-[#94A3B8]">
                              {reviewsData.total} lượt đánh giá
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= Math.round(reviewsData.avgRating)
                                    ? "fill-amber-400"
                                    : "text-zinc-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isLoadingReviews ? (
                      <div className="py-12 flex justify-center items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#12D18E]" />
                      </div>
                    ) : !reviewsData || reviewsData.reviews.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
                          <Star className="w-7 h-7 text-zinc-500" />
                        </div>
                        <p className="text-sm font-bold text-white">Chưa có đánh giá nào</p>
                        <p className="text-xs text-[#94A3B8] max-w-md leading-relaxed">
                          Khi bạn hoàn thành hợp đồng và đối tác nghiệm thu, những lời khen ngợi và đánh giá số sao sẽ xuất hiện ở đây để tăng độ uy tín cho hồ sơ của bạn.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reviewsData.reviews.map((rev: any) => (
                          <div
                            key={rev.id}
                            className="p-4 rounded-xl bg-[#111111] border border-[#222222] hover:border-[#333333] transition-colors space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 p-[2px]">
                                  <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center font-bold text-xs text-white">
                                    {(rev.reviewerName || "D").substring(0, 2).toUpperCase()}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">
                                    {rev.reviewerName || "Đối tác"}
                                  </h4>
                                  <span className="text-[11px] text-[#64748B]">
                                    {new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= rev.rating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-zinc-700"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-bold text-white ml-1">
                                  {rev.rating}.0
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-[#CBD5E1] bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                              "{rev.comment || "Đối tác hài lòng với quá trình hợp tác."}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>

          </div>
        </main>

        {/* PORTFOLIO MODAL (Nested) */}
        {showPortfolioPopup && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-[#222222]">
                <div>
                  <h3 className="text-lg font-bold text-white">Thêm dự án Portfolio</h3>
                  <p className="text-[12px] text-[#94A3B8]">Dự án này sẽ hiển thị công khai trên hồ sơ của bạn.</p>
                </div>
                <button 
                  onClick={() => setShowPortfolioPopup(false)}
                  className="text-[#64748B] hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Tên dự án</label>
                  <input type="text" placeholder="Ví dụ: Thiết kế UI/UX App Ngân hàng" className="w-full p-3 rounded-xl bg-[#161616] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Vai trò của bạn</label>
                  <input type="text" placeholder="Ví dụ: Frontend Lead, UI Designer..." className="w-full p-3 rounded-xl bg-[#161616] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Đường dẫn / Link tham khảo (Tùy chọn)</label>
                  <input type="url" placeholder="https://..." className="w-full p-3 rounded-xl bg-[#161616] border border-[#222222] text-white focus:ring-1 focus:ring-[#12D18E] outline-none text-[13px]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Hình ảnh Thumbnail</label>
                  <div className="border-2 border-dashed border-[#222222] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#161616] transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 text-[#64748B] mb-2" />
                    <p className="text-[12px] text-white font-bold">Kéo thả hoặc click để tải ảnh lên</p>
                    <p className="text-[10px] text-[#94A3B8] mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#222222] bg-[#0C0C0C] flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPortfolioPopup(false)}
                  className="bg-transparent border-[#222222] text-white hover:bg-[#161616]"
                >
                  Hủy bỏ
                </Button>
                <Button type="button" className="bg-[#12D18E] text-black hover:bg-[#0EAE75] font-bold px-6">
                  Lưu Dự Án
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
