import type { Metadata } from "next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileModal from "@/components/profile/ProfileModal";

export const metadata: Metadata = {
  title: {
    template: "%s | FreelanceX",
    default: "FreelanceX - Nền tảng Freelance & Escrow",
  },
  description: "Quản lý công việc, hợp đồng và thanh toán ký quỹ an toàn trên FreelanceX.",
};

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
      <ProfileModal />
    </DashboardLayout>
  );
}
