'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle2, DollarSign, Calendar, Target, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCreateProject } from '@/hooks/api/useProjects';
import { toast } from 'sonner';

interface CreateProjectModalProps {
    onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills: '',
        category: 'Lập trình & Development',
        type: 'Remote',
        budget: '',
        deadline: '',
        milestones: [{ id: Date.now(), title: '', amount: '' }]
    });

    const updateData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [...prev.milestones, { id: Date.now(), title: '', amount: '' }]
        }));
    };

    const removeMilestone = (id: number) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.filter(m => m.id !== id)
        }));
    };

    const updateMilestone = (id: number, field: 'title' | 'amount', value: string) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.map(m => m.id === id ? { ...m, [field]: value } : m)
        }));
    };

    const totalMilestonesAmount = formData.milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    const budgetNumber = Number(formData.budget) || 0;
    const isBudgetMatching = totalMilestonesAmount === budgetNumber && budgetNumber > 0;

    const createProjectMutation = useCreateProject();

    const handleSubmit = () => {
        createProjectMutation.mutate({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            type: formData.type,
            budget: Number(formData.budget),
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
            milestones: formData.milestones.map(m => ({
                title: m.title,
                amount: Number(m.amount)
            }))
        }, {
            onSuccess: () => {
                toast.success("Dự án đã được đăng thành công!");
                onClose();
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đăng dự án.");
                console.error(error);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0A0A0A] border border-[#222222] w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Đăng dự án mới</h2>
                        <p className="text-xs text-[#94A3B8] mt-1">Bước {step}/4: {
                            step === 1 ? "Thông tin cơ bản" :
                                step === 2 ? "Ngân sách & Thời gian" :
                                    step === 3 ? "Các mốc giải ngân" : "Xem lại & Đăng"
                        }</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#161616] text-[#64748B] hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    {/* STEP 1: BASIC INFO */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase">Tên dự án</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] z-10 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateData('title', e.target.value)}
                                        placeholder="VD: Thiết kế ứng dụng Mobile App giao hàng..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm text-white focus:bg-white/[0.05] focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all placeholder:text-[#64748B]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase">Mô tả chi tiết</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => updateData('description', e.target.value)}
                                    placeholder="Mô tả rõ yêu cầu công việc, phạm vi dự án..."
                                    className="w-full p-4 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm text-white focus:bg-white/[0.05] focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all placeholder:text-[#64748B] resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase">Kỹ năng yêu cầu</label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => updateData('skills', e.target.value)}
                                    placeholder="VD: React, Node.js, UI/UX (Cách nhau bằng dấu phẩy)"
                                    className="w-full p-4 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm text-white focus:bg-white/[0.05] focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all placeholder:text-[#64748B]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase">Danh mục dự án</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => updateData('category', e.target.value)}
                                        className="w-full p-3.5 rounded-xl bg-[#161616] border border-white/10 text-sm text-white focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="Lập trình & Development">Lập trình & Development</option>
                                        <option value="Thiết kế (Design)">Thiết kế (Design)</option>
                                        <option value="Content & Marketing">Content & Marketing</option>
                                        <option value="Dịch thuật & Viết lách">Dịch thuật & Viết lách</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase">Hình thức làm việc</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => updateData('type', e.target.value)}
                                        className="w-full p-3.5 rounded-xl bg-[#161616] border border-white/10 text-sm text-white focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="Remote">Remote</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: BUDGET & TIMELINE */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase">Tổng ngân sách (VNĐ)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] z-10 pointer-events-none" />
                                    <input
                                        type="number"
                                        value={formData.budget}
                                        onChange={(e) => updateData('budget', e.target.value)}
                                        placeholder="10,000,000"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm text-white focus:bg-white/[0.05] focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all placeholder:text-[#64748B]"
                                    />
                                </div>
                                <p className="text-xs text-[#64748B] mt-2">Số tiền này sẽ được khóa (Escrow) khi dự án bắt đầu.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase">Hạn chót dự kiến</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] z-10 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => updateData('deadline', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm text-[#94A3B8] focus:text-white focus:bg-white/[0.05] focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: MILESTONES */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between bg-[#12D18E]/10 border border-[#12D18E]/20 rounded-xl p-4">
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">Tổng ngân sách</p>
                                    <p className="text-[#12D18E] font-black text-lg">{formatCurrency(budgetNumber)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-white uppercase">Đã chia</p>
                                    <p className={`font-black text-lg ${totalMilestonesAmount > budgetNumber ? 'text-red-500' : 'text-[#94A3B8]'}`}>
                                        {formatCurrency(totalMilestonesAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {formData.milestones.map((milestone, index) => (
                                    <div key={milestone.id} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-3 rounded-xl">
                                        <div className="flex-1 space-y-1 sm:space-y-2">
                                            <input
                                                type="text"
                                                value={milestone.title}
                                                onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                                                placeholder={`Tên Giai đoạn ${index + 1}`}
                                                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-black/50 text-sm text-white focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all placeholder:text-[#64748B]"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 sm:w-36 space-y-1 sm:space-y-2">
                                                <input
                                                    type="number"
                                                    value={milestone.amount}
                                                    onChange={(e) => updateMilestone(milestone.id, 'amount', e.target.value)}
                                                    placeholder="Số tiền"
                                                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-black/50 text-sm text-white focus:border-[#12D18E]/50 focus:ring-1 focus:ring-[#12D18E]/50 outline-none transition-all placeholder:text-[#64748B]"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeMilestone(milestone.id)}
                                                disabled={formData.milestones.length === 1}
                                                className="p-2 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={addMilestone}
                                className="w-full border-dashed border-white/10 bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white transition-all h-10 rounded-xl"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Thêm Giai đoạn (Milestone)
                            </Button>

                            {!isBudgetMatching && budgetNumber > 0 && (
                                <p className="text-red-500 text-[11px] text-center font-bold uppercase tracking-wider bg-red-500/10 py-2 rounded-lg">
                                    Tổng tiền Milestones phải bằng Tổng ngân sách
                                </p>
                            )}
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-[#12D18E]/10 border border-[#12D18E]/30 rounded-xl p-5 text-center space-y-2">
                                <Target className="w-10 h-10 text-[#12D18E] mx-auto mb-2" />
                                <h3 className="text-lg font-bold text-white">Dự án đã sẵn sàng!</h3>
                            </div>

                            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-xl p-4 space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Tên dự án</p>
                                    <p className="text-white text-sm font-medium mt-0.5">{formData.title || "Chưa nhập"}</p>
                                </div>
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#64748B] uppercase">Tổng ngân sách</p>
                                        <p className="text-white font-bold mt-0.5 text-sm">{formatCurrency(budgetNumber)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#64748B] uppercase">Thời hạn</p>
                                        <p className="text-white font-medium mt-0.5 text-sm">{formData.deadline || "Chưa chọn"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-[#64748B] uppercase">Các Giai đoạn (Milestones)</h4>
                                {formData.milestones.map((m, i) => (
                                    <div key={i} className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                                        <span className="text-xs text-[#94A3B8]"><span className="font-bold text-white mr-1">#{i + 1}</span> {m.title || "..."}</span>
                                        <span className="text-xs font-bold text-[#12D18E]">{formatCurrency(Number(m.amount) || 0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between bg-transparent rounded-b-3xl">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(prev => prev - 1)}
                        disabled={step === 1}
                        className="text-[#94A3B8] hover:text-white gap-1"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4" />Quay lại
                    </Button>

                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all ${step === s ? 'bg-[#12D18E] w-3' : 'bg-[#2A2A2A]'}`} />
                        ))}
                    </div>

                    {step < 4 ? (
                        <Button
                            onClick={() => setStep(prev => prev + 1)}
                            disabled={(step === 1 && !formData.title) || (step === 3 && !isBudgetMatching)}
                            className="bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] font-bold gap-1"
                            size="sm"
                        >
                            Tiếp theo<ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={createProjectMutation.isPending}
                            className="bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] font-bold shadow-[0_0_15px_rgba(18,209,142,0.3)] gap-1"
                            size="sm"
                        >
                            {createProjectMutation.isPending ? 'Đang đăng...' : 'Đăng Ngay'}<CheckCircle2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
}
