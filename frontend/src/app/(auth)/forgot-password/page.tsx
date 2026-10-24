'use client';

import { useState } from 'react';
import { ArrowRight, Mail, Lock, KeyRound, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForgotPasswordMutation, useResetPasswordMutation } from '@/hooks/useAuth';

const emailSchema = z.object({
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
});

const otpSchema = z.object({
    code: z.string().length(6, 'Mã OTP phải gồm 6 chữ số').regex(/^\d+$/, 'Mã OTP chỉ bao gồm số'),
});

const passwordSchema = z.object({
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const forgotPasswordMutation = useForgotPasswordMutation();
    const resetPasswordMutation = useResetPasswordMutation();

    const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
    const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });
    const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

    const onEmailSubmit = (data: EmailForm) => {
        forgotPasswordMutation.mutate(data, {
            onSuccess: () => {
                setEmail(data.email);
                setStep(2);
            }
        });
    };

    const onOtpSubmit = (data: OtpForm) => {
        setStep(3); // Just go to step 3 to input password, the actual API call is done together with the new password
    };

    const onPasswordSubmit = (data: PasswordForm) => {
        const otpData = otpForm.getValues();
        resetPasswordMutation.mutate({
            email,
            code: otpData.code,
            newPassword: data.newPassword
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto">
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="space-y-2 text-center md:text-left">
                        <Link href="/login" className="inline-flex items-center text-xs text-[#64748B] hover:text-[#12D18E] transition-colors mb-4">
                            <ArrowLeft className="w-3 h-3 mr-1" /> Quay lại
                        </Link>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Quên Mật Khẩu</h1>
                        <p className="text-[#94A3B8] text-sm leading-relaxed">
                            Nhập địa chỉ email của bạn, chúng tôi sẽ gửi một mã OTP gồm 6 chữ số để khôi phục mật khẩu.
                        </p>
                    </div>

                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">Địa chỉ Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                                <input
                                    {...emailForm.register('email')}
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569]"
                                />
                            </div>
                            {emailForm.formState.errors.email && (
                                <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
                            )}
                        </div>

                        <Button disabled={forgotPasswordMutation.isPending} className="w-full h-11 rounded-xl bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] text-sm font-bold mt-4 transition-all disabled:opacity-50">
                            {forgotPasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Gửi Mã OTP <ArrowRight className="w-4 h-4" /></>}
                        </Button>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2 text-center md:text-left">
                        <button onClick={() => setStep(1)} className="inline-flex items-center text-xs text-[#64748B] hover:text-[#12D18E] transition-colors mb-4">
                            <ArrowLeft className="w-3 h-3 mr-1" /> Đổi Email
                        </button>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Nhập Mã OTP</h1>
                        <p className="text-[#94A3B8] text-sm leading-relaxed">
                            Mã xác minh 6 chữ số đã được gửi tới <br />
                            <span className="text-white font-bold">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">Mã Xác Minh</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                                <input
                                    {...otpForm.register('code')}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent border border-white/10 text-center tracking-[0.5em] font-mono text-lg text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                                />
                            </div>
                            {otpForm.formState.errors.code && (
                                <p className="text-red-500 text-xs mt-1">{otpForm.formState.errors.code.message}</p>
                            )}
                        </div>

                        <Button disabled={false} className="w-full h-11 rounded-xl bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] text-sm font-bold mt-4 transition-all disabled:opacity-50">
                            <>Xác Nhận <ArrowRight className="w-4 h-4" /></>
                        </Button>

                        <div className="text-center mt-4">
                            <button type="button" onClick={() => onEmailSubmit({ email })} disabled={forgotPasswordMutation.isPending} className="text-[12px] text-[#64748B] hover:text-[#12D18E] transition-colors disabled:opacity-50">
                                {forgotPasswordMutation.isPending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Tạo Mật Khẩu</h1>
                        <p className="text-[#94A3B8] text-sm leading-relaxed">
                            Mã xác minh hợp lệ! Vui lòng tạo mật khẩu mới cho tài khoản của bạn.
                        </p>
                    </div>

                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">Mật khẩu mới</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                                <input
                                    {...passwordForm.register('newPassword')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordForm.formState.errors.newPassword && (
                                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                                <input
                                    {...passwordForm.register('confirmPassword')}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button disabled={resetPasswordMutation.isPending} className="w-full h-11 rounded-xl bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] text-sm font-bold mt-4 transition-all disabled:opacity-50">
                            {resetPasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Hoàn Tất <ArrowRight className="w-4 h-4" /></>}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}
