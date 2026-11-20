import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-lavender text-ink hover:bg-lavender/85",
  secondary: "border border-line bg-raised text-fg hover:bg-line",
  ghost: "text-muted hover:bg-raised hover:text-fg",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
