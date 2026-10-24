'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, LayoutGrid, List, RotateCcw, Briefcase, Loader2 } from 'lucide-react';
import ProjectCard, { JobCardItem } from '@/components/projects/ProjectCard';
import JobBanner from '@/components/jobs/JobBanner';
import JobSidebar from '@/components/jobs/JobSidebar';
import { useGetProjects } from '@/hooks/api/useProjects';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from '@/hooks/useDebounce';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Project } from '@/types';

function JobsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [category, setCategory] = useState<string>(searchParams.get('category') || '');
    const [type, setType] = useState<string>(searchParams.get('type') || '');
    const [budgetRange, setBudgetRange] = useState<string>(searchParams.get('budgetRange') || '');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(
        searchParams.get('skills') ? searchParams.get('skills')!.split(',') : []
    );

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearchTerm) params.set('search', debouncedSearchTerm); else params.delete('search');
        if (category) params.set('category', category); else params.delete('category');
        if (type) params.set('type', type); else params.delete('type');
        if (budgetRange) params.set('budgetRange', budgetRange); else params.delete('budgetRange');
        if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(',')); else params.delete('skills');

        const newSearch = params.toString();
        const currentSearch = searchParams.toString();
        if (currentSearch !== newSearch) {
            router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false });
        }
    }, [debouncedSearchTerm, category, type, budgetRange, selectedSkills, pathname, router, searchParams]);

    const handleReset = () => {
        setSearchTerm('');
        setCategory('');
        setType('');
        setBudgetRange('');
        setSelectedSkills([]);
    };

    // Parse budget range
    let budgetMin: number | undefined;
    let budgetMax: number | undefined;
    if (budgetRange === 'under1m') budgetMax = 1000000;
    if (budgetRange === '1m-5m') { budgetMin = 1000000; budgetMax = 5000000; }
    if (budgetRange === '5m-10m') { budgetMin = 5000000; budgetMax = 10000000; }
    if (budgetRange === 'over10m') budgetMin = 10000000;

    const { ref, inView } = useInView();
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetProjects(false, {
        search: debouncedSearchTerm,
        category: category || undefined,
        type: type || undefined,
        budgetMin,
        budgetMax,
        skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const apiProjects: Project[] = data?.pages.flatMap((page) => page.data) || [];

    const jobs: JobCardItem[] = apiProjects.map((p) => {
        const companyName = p.client?.fullName || 'Khách hàng ẩn danh';
        return {
            id: p.id,
            title: p.title,
            company: companyName,
            avatar: p.client?.avatarUrl,
            location: p.client?.location || 'Chưa cập nhật',
            type: [p.type || 'Freelance'],
            budget: `${Number(p.budget).toLocaleString('vi-VN')} đ`,
            skills: p.skills?.map((s) => s.skill?.name || '').filter(Boolean) || [],
            postedAt: new Date(p.createdAt).toLocaleDateString('vi-VN'),
            verified: true,
            logoColor: 'bg-[#12D18E]/20 text-[#12D18E]',
        };
    });

    return (
        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto animate-in fade-in bg-[#060807]">
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 max-w-[1600px] mx-auto w-full">

                {/* LEFT COLUMN: MAIN CONTENT */}
                <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">

                    {/* HERO BANNER */}
                    <JobBanner />

                    {/* SEARCH & QUICK FILTERS BAR */}
                    <div className="flex flex-col lg:flex-row gap-2.5 w-full">
                        <div className="relative w-full lg:flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5E6B65]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm công việc..."
                                className="w-full bg-[#0F1412] border border-[#232B27] rounded-xl py-2.5 pl-9 pr-4 text-[12px] text-white placeholder-[#5E6B65] focus:outline-none focus:border-[#12D18E]/50"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto pb-1 lg:pb-0">
                            <CustomSelect
                                value={category}
                                onChange={(val) => setCategory(val)}
                                options={[
                                    { value: "", label: "Tất cả danh mục" },
                                    { value: "Lập trình & Development", label: "Lập trình & Development" },
                                    { value: "Thiết kế (Design)", label: "Thiết kế (Design)" },
                                    { value: "Content & Marketing", label: "Content & Marketing" },
                                ]}
                                className="w-auto shrink-0"
                                placeholder="Danh mục"
                            />
                            <CustomSelect
                                value={budgetRange}
                                onChange={(val) => setBudgetRange(val)}
                                options={[
                                    { value: "", label: "Tất cả mức lương" },
                                    { value: "under1m", label: "Dưới 1 triệu ₫" },
                                    { value: "1m-5m", label: "1 triệu - 5 triệu ₫" },
                                    { value: "5m-10m", label: "5 triệu - 10 triệu ₫" },
                                    { value: "over10m", label: "Trên 10 triệu ₫" },
                                ]}
                                className="w-auto shrink-0"
                                placeholder="Mức lương"
                            />
                            <CustomSelect
                                value={type}
                                onChange={(val) => setType(val)}
                                options={[
                                    { value: "", label: "Tất cả hình thức" },
                                    { value: "Full-time", label: "Full-time" },
                                    { value: "Part-time", label: "Part-time" },
                                    { value: "Remote", label: "Remote" },
                                ]}
                                className="w-auto shrink-0"
                                placeholder="Hình thức"
                            />

                            {(searchTerm || category || type || budgetRange || selectedSkills.length > 0) && (
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 px-3 py-2.5 bg-[#12D18E]/10 text-[#12D18E] hover:bg-[#12D18E]/20 hover:text-[#12D18E] rounded-xl text-[12px] font-bold transition-colors shrink-0"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                                </button>
                            )}

                            <div className="flex items-center bg-[#0F1412] border border-[#232B27] rounded-xl overflow-hidden p-1 shrink-0">
                                <button className="p-1.5 bg-[#12D18E]/20 text-[#12D18E] rounded-lg" aria-label="Lưới">
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1.5 text-[#5E6B65] hover:text-white rounded-lg" aria-label="Danh sách">
                                    <List className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LIST OF CARDS */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-[#12D18E] animate-spin" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col justify-center items-center py-20 text-[#5E6B65] gap-3 bg-[#0F1412] rounded-3xl border border-[#232B27]">
                            <Briefcase className="w-12 h-12 opacity-50" />
                            <p className="text-[13px]">Hiện chưa có dự án nào phù hợp.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((proj) => (
                                <ProjectCard key={proj.id} project={proj} />
                            ))}
                        </div>
                    )}

                    <div ref={ref} className="mt-8 py-4 w-full flex justify-center">
                        {isFetchingNextPage && <Loader2 className="w-6 h-6 text-[#12D18E] animate-spin" />}
                    </div>

                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <JobSidebar
                    category={category}
                    onCategoryChange={setCategory}
                    budgetRange={budgetRange}
                    onBudgetRangeChange={setBudgetRange}
                    type={type}
                    onTypeChange={setType}
                    onResetAll={handleReset}
                />
            </div>
        </main>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full min-h-screen bg-[#060807]">
                <Loader2 className="w-8 h-8 animate-spin text-[#12D18E]" />
            </div>
        }>
            <JobsContent />
        </Suspense>
    );
}
