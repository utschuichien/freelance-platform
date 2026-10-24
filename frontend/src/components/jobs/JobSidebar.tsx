import { useState } from 'react';
import { Filter, Check, ChevronDown } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface JobSidebarProps {
  category: string;
  onCategoryChange: (cat: string) => void;
  budgetRange: string;
  onBudgetRangeChange: (range: string) => void;
  type: string;
  onTypeChange: (t: string) => void;
  onResetAll: () => void;
}

export default function JobSidebar({
  category,
  onCategoryChange,
  budgetRange,
  onBudgetRangeChange,
  type,
  onTypeChange,
  onResetAll,
}: JobSidebarProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const categories = [
    { label: 'Lập trình & Development' },
    { label: 'Thiết kế (Design)' },
    { label: 'Content & Marketing' },
    { label: 'Mobile & App' },
    { label: 'Khác' },
  ];

  const types = [
    { label: 'Full-time' },
    { label: 'Part-time' },
    { label: 'Remote' },
    { label: 'Hybrid' },
  ];

  return (
    <div className="w-full lg:w-[340px] shrink-0 order-first lg:order-last">
      <div className="lg:sticky lg:top-0 lg:h-[calc(100vh-64px)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 lg:pb-0">
        <div className="flex flex-col gap-6">
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
              <button
                onClick={onResetAll}
                className="text-[10px] font-bold text-[#12D18E] hover:underline cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>

            <div className={`space-y-6 ${isMobileExpanded ? 'block' : 'hidden lg:block'}`}>
              {/* Danh mục */}
              <div>
                <h4 className="text-[11px] font-bold text-white mb-3 uppercase tracking-wider">Danh mục</h4>
                <div className="space-y-2.5">
                  {categories.map((cat) => (
                    <label
                      key={cat.label}
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => onCategoryChange(cat.label === category ? '' : cat.label)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors ${
                            cat.label === category
                              ? 'bg-[#12D18E] border-[#12D18E]'
                              : 'border-[#3A4640] group-hover:border-[#12D18E]'
                          }`}
                        >
                          {cat.label === category && (
                            <Check className="w-2.5 h-2.5 text-[#06140F] stroke-[3]" />
                          )}
                        </div>
                        <span
                          className={`text-[12px] ${
                            cat.label === category ? 'text-white font-medium' : 'text-[#8F9F97]'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mức lương */}
              <div>
                <h4 className="text-[11px] font-bold text-white mb-3 uppercase tracking-wider">Mức lương</h4>
                <CustomSelect
                  value={budgetRange}
                  onChange={onBudgetRangeChange}
                  options={[
                    { value: '', label: 'Tất cả mức lương' },
                    { value: 'under1m', label: 'Dưới 1 triệu ₫' },
                    { value: '1m-5m', label: '1 triệu - 5 triệu ₫' },
                    { value: '5m-10m', label: '5 triệu - 10 triệu ₫' },
                    { value: 'over10m', label: 'Trên 10 triệu ₫' },
                  ]}
                />
              </div>

              {/* Hình thức làm việc */}
              <div>
                <h4 className="text-[11px] font-bold text-white mb-3 uppercase tracking-wider">Hình thức làm việc</h4>
                <div className="space-y-2.5">
                  {types.map((t) => (
                    <label
                      key={t.label}
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => onTypeChange(t.label === type ? '' : t.label)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors ${
                            t.label === type
                              ? 'bg-[#12D18E] border-[#12D18E]'
                              : 'border-[#3A4640] group-hover:border-[#12D18E]'
                          }`}
                        >
                          {t.label === type && (
                            <Check className="w-2.5 h-2.5 text-[#06140F] stroke-[3]" />
                          )}
                        </div>
                        <span
                          className={`text-[12px] ${
                            t.label === type ? 'text-white font-medium' : 'text-[#8F9F97]'
                          }`}
                        >
                          {t.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
