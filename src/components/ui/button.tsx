import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-active",
        secondary:
          "bg-surface text-ink border border-hairline hover:border-hairline-strong",
        ghost: "bg-transparent text-body hover:text-ink hover:bg-canvas-soft",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        md: "h-9 px-3.5 text-[13px]",
        sm: "h-8 px-2.5 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonStyles({ variant, size }), className)} {...props} />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  href,
  ...props
}: VariantProps<typeof buttonStyles> &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  );
}
