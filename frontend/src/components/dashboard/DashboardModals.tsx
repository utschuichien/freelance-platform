import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardModalsProps {
  showDepositModal: boolean;
  setShowDepositModal: (show: boolean) => void;
  setAvailableBalance: React.Dispatch<React.SetStateAction<number>>;

  showCreateProjectModal: boolean;
  setShowCreateProjectModal: (show: boolean) => void;
  projects: any[];
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;

  activeSubmitModalMilestone: any | null;
  setActiveSubmitModalMilestone: (m: any | null) => void;
  setMilestones: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function DashboardModals({
  showDepositModal,
  setShowDepositModal,
  setAvailableBalance,
  showCreateProjectModal,
  setShowCreateProjectModal,
  projects,
  setProjects,
  activeSubmitModalMilestone,
  setActiveSubmitModalMilestone,
  setMilestones
}: DashboardModalsProps) {

  // Local Form States
  const [depositInput, setDepositInput] = useState<string>("1000");
  const [newProjectTitle, setNewProjectTitle] = useState<string>("");
  const [newProjectBudget, setNewProjectBudget] = useState<string>("2500");
  const [submitLink, setSubmitLink] = useState<string>("");

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitModalMilestone) return;
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === activeSubmitModalMilestone.id
          ? { ...m, status: "SUBMITTED", link: submitLink || "https://github.com/repo" }
          : m
      )
    );
    setActiveSubmitModalMilestone(null);
  };

  return (
    <>
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-md border border-[#12D18E]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <h3 className="text-base font-bold text-white">Nạp Tiền Giả Lập</h3>
              <button onClick={() => setShowDepositModal(false)}><X className="w-4 h-4 text-[#94A3B8]" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const amt = parseFloat(depositInput);
              if (amt > 0) setAvailableBalance((prev) => prev + amt);
              setShowDepositModal(false);
            }} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#94A3B8] block mb-1">Số Tiền Nạp ($ USD)</label>
                <input
                  type="number"
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  className="w-full p-3 rounded-md bg-[#161616] border border-[#222222] text-white focus:outline-none focus:border-[#12D18E]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowDepositModal(false)} variant="ghost" size="sm">Hủy</Button>
                <Button type="submit" size="sm" className="bg-[#12D18E] text-black hover:bg-[#0EAE75]">Xác Nhận Nạp</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-[#12D18E]/40 space-y-4 glow-mint">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <h3 className="text-base font-bold text-white">Đăng Dự Án Mới</h3>
              <button onClick={() => setShowCreateProjectModal(false)}><X className="w-4 h-4 text-[#94A3B8]" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newProjectTitle) {
                setProjects([{ id: `p-${Date.now()}`, title: newProjectTitle, budget: parseFloat(newProjectBudget) || 2000, status: "OPEN", bids: 0 }, ...projects]);
              }
              setShowCreateProjectModal(false);
            }} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#94A3B8] block mb-1">Tên Dự Án</label>
                <input
                  type="text"
                  placeholder="VD: Cấu hình RabbitMQ Cluster"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full p-3 rounded-md bg-[#161616] border border-[#222222] text-white focus:outline-none focus:border-[#12D18E]"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-[#94A3B8] block mb-1">Ngân Sách ($ USD)</label>
                <input
                  type="number"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(e.target.value)}
                  className="w-full p-3 rounded-md bg-[#161616] border border-[#222222] text-white focus:outline-none focus:border-[#12D18E]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowCreateProjectModal(false)} variant="ghost" size="sm">Hủy</Button>
                <Button type="submit" size="sm" className="bg-[#12D18E] text-black hover:bg-[#0EAE75]">Đăng Bài</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubmitModalMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-[#12D18E]/40 space-y-4 glow-mint">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <h3 className="text-base font-bold text-white">Nộp Bài Sản Phẩm</h3>
              <button onClick={() => setActiveSubmitModalMilestone(null)}><X className="w-4 h-4 text-[#94A3B8]" /></button>
            </div>
            <form onSubmit={handleSubmitWork} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#94A3B8] block mb-1">Link GitHub / Demo</label>
                <input
                  type="url"
                  placeholder="https://github.com/repo"
                  value={submitLink}
                  onChange={(e) => setSubmitLink(e.target.value)}
                  className="w-full p-3 rounded-md bg-[#161616] border border-[#222222] text-white focus:outline-none focus:border-[#12D18E]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setActiveSubmitModalMilestone(null)} variant="ghost" size="sm">Hủy</Button>
                <Button type="submit" size="sm" className="bg-[#12D18E] text-black hover:bg-[#0EAE75]">Nộp Bài</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
