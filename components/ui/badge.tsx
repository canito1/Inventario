import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-copilot-pill border font-medium transition-copilot focus:outline-none focus:ring-2 focus:ring-[--ring] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[--border] bg-[--surface] text-[--surface-foreground]",
        secondary:
          "border-[--border] bg-[--secondary] text-[--secondary-foreground] hover:bg-[--secondary]/80",
        destructive:
          "border-transparent bg-[--destructive] text-[--destructive-foreground] hover:opacity-90",
        outline: "border-[--border] bg-transparent text-[--foreground]",
        accent: "border-transparent bg-[--primary] text-[--primary-foreground]",
        warning: "border-transparent bg-[--warning] text-[--warning-foreground]",
        success: "border-transparent bg-[--success] text-[--success-foreground]",
      },
      size: {
        default: "text-xs px-2 py-1",
        sm: "text-[10px] px-1.5 py-0.5",
        lg: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  responsive?: boolean
}

function Badge({ className, variant, size, responsive = true, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        responsive && "whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }