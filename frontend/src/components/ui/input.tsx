import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#2A364F] bg-[#0B0F17] px-3.5 py-2 text-xs text-white placeholder-[#64748B] transition-all file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:outline-none focus-visible:border-[#12D18E] focus-visible:ring-1 focus-visible:ring-[#12D18E] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
