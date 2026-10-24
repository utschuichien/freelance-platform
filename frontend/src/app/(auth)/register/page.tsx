'use client';

import { useState } from 'react';
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRegisterMutation } from '@/hooks/useAuth';

const registerSchema = z.object({
    fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
    phoneNumber: z.string().optional(),
    password: z
        .string()
        .nonempty('Vui lòng nhập mật khẩu')
        .min(6, 'Mật khẩu phải dài ít nhất 6 ký tự'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [role, setRole] = useState<'FREELANCER' | 'CLIENT'>('FREELANCER');
    const [showPassword, setShowPassword] = useState(false);

    const registerMutation = useRegisterMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterForm) => {
        registerMutation.mutate({ ...data, role });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white tracking-tight">Tạo Tài Khoản</h1>
                <p className="text-[#94A3B8]">Tham gia cộng đồng Freelance lớn nhất.</p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setRole('FREELANCER')}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === 'FREELANCER'
                            ? 'bg-[#12D18E]/10 border-[#12D18E] text-[#12D18E] ring-1 ring-[#12D18E]/50'
                            : 'bg-transparent border-white/10 text-[#94A3B8] hover:border-white/20 hover:bg-white/5'
                    }`}
                >
                    Tôi là Freelancer
                </button>
                <button
                    onClick={() => setRole('CLIENT')}
                    className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === 'CLIENT'
                            ? 'bg-[#12D18E]/10 border-[#12D18E] text-[#12D18E] ring-1 ring-[#12D18E]/50'
                            : 'bg-transparent border-white/10 text-[#94A3B8] hover:border-white/20 hover:bg-white/5'
                    }`}
                >
                    Tôi là Client
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">
                        Họ và Tên
                    </label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input
                            {...register('fullName')}
                            type="text"
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569]"
                        />
                    </div>
                    {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">
                        Địa chỉ Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569]"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">
                        Số điện thoại (Tuỳ chọn)
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input
                            {...register('phoneNumber')}
                            type="tel"
                            placeholder="0912345678"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569]"
                        />
                    </div>
                    {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-[12px] font-medium text-[#94A3B8] mb-3">
                        Mật khẩu
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-white focus:bg-white/5 focus:border-[#12D18E] outline-none transition-all placeholder:text-[#475569]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>

                <Button
                    disabled={registerMutation.isPending}
                    className="w-full h-11 rounded-xl bg-[#12D18E] text-[#0C0C0C] hover:bg-[#0EAE75] text-sm font-bold mt-4 shadow-[0_0_15px_rgba(18,209,142,0.15)] hover:shadow-[0_0_25px_rgba(18,209,142,0.25)] transition-all disabled:opacity-50"
                >
                    {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            Đăng Ký <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2A2A2A]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold">
                    <span className="bg-[#0C0C0C] px-3 text-[#64748B]">HOẶC</span>
                </div>
            </div>

            <div className="w-full">
                <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl bg-transparent border border-white/10 text-white hover:bg-white/5 transition-all font-medium text-sm"
                >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Tiếp tục với Google
                </Button>
            </div>

            <p className="text-center text-sm text-[#94A3B8]">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-[#12D18E] hover:underline font-bold">
                    Đăng nhập ngay
                </Link>
            </p>
        </div>
    );
}
