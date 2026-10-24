import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#12D18E]/30 bg-[#12D18E]/10 text-[#12D18E]",
        secondary:
          "border-[#2A364F] bg-[#151D2A] text-[#94A3B8]",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-400",
        outline: "text-white border-[#2A364F]",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        info: "border-sky-500/30 bg-sky-500/10 text-sky-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
