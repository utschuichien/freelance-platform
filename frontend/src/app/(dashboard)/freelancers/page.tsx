"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, LayoutGrid, List, Loader2, Users, RotateCcw } from "lucide-react";
import FreelancerCard, { FreelancerCardData } from "@/components/freelancers/FreelancerCard";
import FreelancerBanner from "@/components/freelancers/FreelancerBanner";
import FreelancerSidebar from "@/components/freelancers/FreelancerSidebar";
import { useGetFreelancers } from "@/hooks/api/useFreelancers";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/hooks/useDebounce";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FreelancerProfile } from "@/types";

function FreelancersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');
  const [rateMin, setRateMin] = useState<number | undefined>(searchParams.get('rateMin') ? Number(searchParams.get('rateMin')) : undefined);
  const [rateMax, setRateMax] = useState<number | undefined>(searchParams.get('rateMax') ? Number(searchParams.get('rateMax')) : undefined);
  const [type, setType] = useState<string>(searchParams.get('type') || '');
  const [sort, setSort] = useState<string>(searchParams.get('sort') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(searchParams.get('skills') ? searchParams.get('skills')!.split(',') : []);

  useEffect(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) params.set('search', debouncedSearchTerm); else params.delete('search');
      if (category) params.set('category', category); else params.delete('category');
      if (type) params.set('type', type); else params.delete('type');
      if (sort) params.set('sort', sort); else params.delete('sort');
      if (rateMin !== undefined) params.set('rateMin', rateMin.toString()); else params.delete('rateMin');
      if (rateMax !== undefined) params.set('rateMax', rateMax.toString()); else params.delete('rateMax');
      if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(',')); else params.delete('skills');
      
      const newSearch = params.toString();
      const currentSearch = searchParams.toString();
      if (currentSearch !== newSearch) {
          router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false });
      }
  }, [debouncedSearchTerm, category, type, sort, rateMin, rateMax, selectedSkills, pathname, router, searchParams]);

  const handleReset = () => {
      setSearchTerm('');
      setCategory('');
      setType('');
      setSort('');
      setRateMin(undefined);
      setRateMax(undefined);
      setSelectedSkills([]);
  };

  const { ref, inView } = useInView();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetFreelancers({ 
    search: debouncedSearchTerm,
    category: category || undefined,
    rateMin,
    rateMax,
    skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const apiData: FreelancerProfile[] = data?.pages.flatMap((page) => page.data) || [];

  const freelancers: FreelancerCardData[] = apiData.map((f) => {
    const rawSkills = Array.isArray(f.skills)
      ? f.skills.map((s) => (typeof s === 'string' ? s : s.skill?.name || '')).filter(Boolean)
      : [];

    return {
      id: f.id || f.userId,
      name: f.fullName || 'Ẩn danh',
      title: f.title || f.bio || "Freelancer Chuyên Nghiệp",
      avatar: f.fullName || 'Freelancer',
      rating: f.rating || 5.0,
      reviews: f.totalReviews || 0,
      hourlyRate: f.hourlyRate ? Number(f.hourlyRate) : 500000,
      skills: rawSkills.length > 0 ? rawSkills : ["Chưa cập nhật"],
      location: f.location || "Chưa cập nhật",
      verified: f.kycStatus === 'VERIFIED',
      isAvailable: true,
    };
  });

  return (
    <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto animate-in fade-in bg-[#060807]">
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 max-w-[1600px] mx-auto w-full">

        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">

          {/* HERO BANNER */}
          <FreelancerBanner />

          {/* SEARCH BAR & FILTERS */}
          <div className="flex flex-col lg:flex-row gap-2.5 w-full">
            <div className="relative w-full lg:flex-1">
              <Search className="w-4 h-4 text-[#5E6B65] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm freelancer theo tên, kỹ năng, công nghệ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F1412] border border-[#232B27] rounded-xl py-2.5 pl-9 pr-4 text-[12px] text-white placeholder-[#5E6B65] focus:outline-none focus:border-[#12D18E]/50"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto pb-1 lg:pb-0">
              <CustomSelect 
                value={category}
                onChange={(val) => setCategory(val)}
                options={[
                  { value: "", label: "Tất cả danh mục" },
                  { value: "Frontend Development", label: "Frontend Development" },
                  { value: "Backend Development", label: "Backend Development" },
                  { value: "Fullstack Development", label: "Fullstack Development" },
                  { value: "Mobile App Development", label: "Mobile App Development" },
                  { value: "UI/UX Design", label: "UI/UX Design" },
                  { value: "DevOps & Cloud", label: "DevOps & Cloud" },
                ]}
                className="w-auto shrink-0"
                placeholder="Danh mục"
              />
              <CustomSelect 
                value={`${rateMin || ''}-${rateMax || ''}`} 
                onChange={(val) => {
                    if (!val || val === '-') { setRateMin(undefined); setRateMax(undefined); }
                    else if (val === '-100000') { setRateMin(undefined); setRateMax(100000); }
                    else if (val === '100000-500000') { setRateMin(100000); setRateMax(500000); }
                    else if (val === '500000-1000000') { setRateMin(500000); setRateMax(1000000); }
                    else if (val === '1000000-') { setRateMin(1000000); setRateMax(undefined); }
                }}
                options={[
                  { value: "-", label: "Tất cả mức giá" },
                  { value: "-100000", label: "Dưới 100.000 ₫" },
                  { value: "100000-500000", label: "100.000 ₫ - 500.000 ₫" },
                  { value: "500000-1000000", label: "500.000 ₫ - 1.000.000 ₫" },
                  { value: "1000000-", label: "Trên 1.000.000 ₫" },
                ]}
                className="w-auto shrink-0"
                placeholder="Mức giá"
              />
              <CustomSelect 
                value={sort}
                onChange={(val) => setSort(val)}
                options={[
                  { value: "", label: "Mới nhất" }
                ]}
                className="w-auto shrink-0"
                placeholder="Mới nhất"
              />

              {(searchTerm || category || type || sort || rateMin !== undefined || rateMax !== undefined || selectedSkills.length > 0) && (
                  <button 
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-[#12D18E]/10 text-[#12D18E] hover:bg-[#12D18E]/20 hover:text-[#12D18E] rounded-xl text-[12px] font-bold transition-colors shrink-0"
                  >
                      <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                  </button>
              )}

              <div className="flex items-center gap-1 bg-[#0F1412] border border-[#232B27] rounded-xl p-1 shrink-0">
                <button className="p-1.5 rounded-lg bg-[#12D18E] text-[#0C0C0C]">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-[#5E6B65] hover:text-white">
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          {/* FREELANCERS LIST */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-[#12D18E] animate-spin" />
            </div>
          ) : freelancers.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-[#5E6B65] gap-3 bg-[#0F1412] rounded-3xl border border-[#232B27]">
                <Users className="w-12 h-12 opacity-50" />
                <p className="text-[13px]">Hiện chưa có freelancer nào phù hợp.</p>
            </div>
          ) : (
            <div className="flex flex-col rounded-3xl border border-[#232B27] bg-[#0F1412] overflow-hidden">
              {freelancers
                .map((freelancer) => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                ))}
            </div>
          )}

          {/* INFINITE SCROLL LOADER */}
          <div ref={ref} className="mt-8 py-4 w-full flex justify-center">
            {isFetchingNextPage && <Loader2 className="w-6 h-6 text-[#12D18E] animate-spin" />}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="w-full lg:w-[340px] shrink-0 order-first lg:order-last">
          <div className="lg:sticky lg:top-0 lg:h-[calc(100vh-64px)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 lg:pb-0">
            <FreelancerSidebar 
              category={category}
              setCategory={setCategory}
              rateMin={rateMin}
              setRateMin={setRateMin}
              rateMax={rateMax}
              setRateMax={setRateMax}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              clearAll={() => {
                setCategory('');
                setRateMin(undefined);
                setRateMax(undefined);
                setSelectedSkills([]);
                setSearchTerm('');
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function FreelancersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full min-h-screen bg-[#060807]"><Loader2 className="w-8 h-8 animate-spin text-[#12D18E]" /></div>}>
      <FreelancersContent />
    </Suspense>
  );
}
