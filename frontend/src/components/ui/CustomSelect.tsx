import { useState, useRef, useEffect, useId, KeyboardEvent } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectId = useId();
  const listboxId = `select-listbox-${selectId}`;
  const buttonId = `select-btn-${selectId}`;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (isOpen) {
      const selectedIdx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value, options]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex].value);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={cn("relative text-left", className)}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className={cn(
          "w-full flex items-center justify-center gap-2 bg-[#0F1412] border border-[#232B27] hover:border-[#12D18E]/50 rounded-xl py-2.5 px-2 text-[12px] text-[#9FADA6] transition-all focus:outline-none focus:ring-1 focus:ring-[#12D18E]/50 h-full",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-[#12D18E]/50 ring-1 ring-[#12D18E]/20"
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[#5E6B65] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[#12D18E]"
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute z-50 min-w-full w-max mt-1.5 bg-[#0A0D0C] border border-[#232B27] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {options.map((option, idx) => {
              const isSelected = value === option.value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-left text-[12px] transition-colors",
                    isHighlighted ? "bg-[#161C19] text-white" : "text-[#8F9F97]",
                    isSelected && "font-medium text-[#12D18E]"
                  )}
                >
                  <span className={cn(isSelected ? "text-white font-medium" : "text-[#8F9F97]")}>
                    {option.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#12D18E]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
