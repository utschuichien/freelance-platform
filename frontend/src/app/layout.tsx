import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FreelanceX",
  description: "Nền tảng Freelance & Ký quỹ Escrow công nghệ cao, tự động giải ngân theo từng Milestone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${plusJakartaSans.variable} dark h-full antialiased`}>
      <body
        className={`${plusJakartaSans.className} bg-[#272727] min-h-screen text-[14px] text-white antialiased selection:bg-[#12D18E]/30 selection:text-[#12D18E]`}
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'border backdrop-blur-md shadow-2xl rounded-xl p-4 flex items-center font-medium',
                success: '!bg-[#12D18E]/10 !border-[#12D18E]/30 !text-white [&_svg]:!text-[#12D18E]',
                error: '!bg-red-500/10 !border-red-500/30 !text-white [&_svg]:!text-red-500',
                warning: '!bg-yellow-500/10 !border-yellow-500/30 !text-white [&_svg]:!text-yellow-500',
                info: '!bg-blue-500/10 !border-blue-500/30 !text-white [&_svg]:!text-blue-500',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
