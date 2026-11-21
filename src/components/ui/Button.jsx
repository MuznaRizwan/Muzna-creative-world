import { cn } from "@/utils/cn";

/**
 * @typedef {"primary" | "secondary" | "ghost"} ButtonVariant
 * @typedef {"sm" | "md" | "lg"} ButtonSize
 * @typedef {import("react").ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: ButtonVariant,
 *   size?: ButtonSize,
 * }} ButtonProps
 */

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";

/** @type {Record<ButtonVariant, string>} */
const variants = {
  primary: "bg-lavender text-ink hover:bg-lavender/85",
  secondary: "border border-line bg-raised text-fg hover:bg-line",
  ghost: "text-muted hover:bg-raised hover:text-fg",
};

/** @type {Record<ButtonSize, string>} */
const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/** @param {ButtonProps} props */
export function Button({ className, variant = "primary", size = "md", type = "button", ...props }) {
  return <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
