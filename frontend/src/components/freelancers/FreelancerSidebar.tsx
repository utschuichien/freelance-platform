import { useState } from "react";
import { Filter, Check, ChevronDown } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface Props {
    category: string;
    setCategory: (c: string) => void;
    rateMin: number | undefined;
    setRateMin: (r: number | undefined) => void;
    rateMax: number | undefined;
    setRateMax: (r: number | undefined) => void;
    selectedSkills: string[];
    setSelectedSkills: React.Dispatch<React.SetStateAction<string[]>>;
    clearAll: () => void;
}

export default function FreelancerSidebar({ category, setCategory, rateMin, setRateMin, rateMax, setRateMax, selectedSkills, setSelectedSkills, clearAll }: Props) {
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    return (
        <div className="flex flex-col gap-6">
            
            {/* FILTER PANEL */}
            <div className="bg-[#0F1412] border border-[#232B27] rounded-3xl p-5 sm:p-6 m-0 mt-0">
                <div className="flex items-center justify-between mb-4 lg:mb-5">
                    <button 
                        type="button"
                        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                        className="flex items-center gap-2 text-white font-bold text-[14px] cursor-pointer lg:cursor-default"
                    >
                        <Filter className="w-4 h-4 text-[#12D18E]" />
                        Bộ lọc chi tiết
                        <ChevronDown className={`w-4 h-4 text-[#8F9F97] lg:hidden transition-transform duration-200 ${isMobileExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={clearAll} className="text-[10px] font-bold text-[#12D18E] hover:underline cursor-pointer">Xóa tất cả</button>
                </div>

                <div className={`space-y-6 ${isMobileExpanded ? 'block' : 'hidden lg:block'}`}>
                    {/* Danh mục */}
                    <div>
                        <h4 className="text-[11px] font-bold text-white mb-3 uppercase tracking-wider">Danh mục</h4>
                        <div className="space-y-2.5">
                            {[
                                { label: 'Tất cả danh mục', count: '' },
                                { label: 'Frontend Development', count: '842' },
                                { label: 'Backend Development', count: '756' },
                                { label: 'Fullstack Development', count: '624' },
                                { label: 'Mobile App Development', count: '418' },
                                { label: 'UI/UX Design', count: '362' },
                                { label: 'DevOps & Cloud', count: '238' }
                            ].map(cat => (
                                <label key={cat.label} className="flex items-center justify-between group cursor-pointer" onClick={() => setCategory(cat.label === 'Tất cả danh mục' ? '' : cat.label)}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors ${cat.label === category || (cat.label === 'Tất cả danh mục' && !category) ? 'bg-[#12D18E] border-[#12D18E]' : 'border-[#3A4640] group-hover:border-[#12D18E]'}`}>
                                            {(cat.label === category || (cat.label === 'Tất cả danh mục' && !category)) && <Check className="w-2.5 h-2.5 text-[#06140F] stroke-[3]" />}
                                        </div>
                                        <span className={`text-[12px] ${cat.label === category || (cat.label === 'Tất cả danh mục' && !category) ? 'text-white font-medium' : 'text-[#8F9F97]'}`}>{cat.label}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Mức giá */}
                    <div>
                        <h4 className="text-[11px] font-bold text-white mb-3 uppercase tracking-wider">Mức giá (VNĐ/giờ)</h4>
                        <div className="flex flex-col gap-2 mb-4">
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
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
