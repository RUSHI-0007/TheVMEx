"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "outline";
  href?: string;
}

export function Button({
  variant = "gold",
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    variant === "gold" ? "btn-gold" : "btn-gold-outline",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    className
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={props.type || "button"} className={classes} {...props}>
      {children}
    </button>
  );
}
