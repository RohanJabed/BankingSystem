import * as React from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/constants";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof STATUS_COLORS | "default" | "outline" | "secondary" | "destructive";
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantClass =
    variant in STATUS_COLORS
      ? STATUS_COLORS[variant as keyof typeof STATUS_COLORS]
      : variant === "outline"
      ? "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
      : variant === "secondary"
      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
      : variant === "destructive"
      ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
