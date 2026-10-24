"use client";

import { useState } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContractCard, { ContractCardData } from "@/components/contracts/ContractCard";
import { useGetContracts } from "@/hooks/api/useContracts";
import { EnrichedContract } from "@/types";

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: rawContracts = [], isLoading } = useGetContracts();

  const contracts = rawContracts as EnrichedContract[];

  const displayedContracts: ContractCardData[] = contracts
    .filter((c) => 
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.client || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((c) => ({
      id: c.id,
      title: c.title || 'Hợp đồng dự án',
      client: c.client || 'Khách hàng',
      totalAmount: Number(c.totalAmount) || 0,
      amountPaid: c.amountPaid || 0,
      deadline: c.milestones?.[0]?.deadline 
        ? new Date(c.milestones[0].deadline).toLocaleDateString('vi-VN') 
        : 'Không có hạn',
      status: c.status,
      progress: c.progress || 0,
    }));

  return (
    <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Quản Lý Hợp Đồng</h1>
          <p className="text-sm text-[#94A3B8]">Theo dõi tiến độ công việc và trạng thái giải ngân Escrow.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm hợp đồng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161616] border border-[#222222] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#12D18E] transition-all"
          />
        </div>
        <Button variant="outline" className="bg-[#111111] border-[#222222] text-[#94A3B8] hover:text-white hover:bg-[#1E1E1E]">
          <Filter className="w-4 h-4 mr-2" /> Trạng Thái
        </Button>
      </div>

      {/* Contracts List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-[#94A3B8]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải dữ liệu hợp đồng...
          </div>
        ) : displayedContracts.length === 0 ? (
          <div className="col-span-full flex items-center justify-center p-12 text-[#94A3B8] border border-dashed border-[#222222] rounded-2xl">
            Không tìm thấy hợp đồng nào.
          </div>
        ) : (
          displayedContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))
        )}
      </div>

    </main>
  );
}
