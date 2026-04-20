"use client";

import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2";

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "border-2 border-primary text-primary hover:bg-primary/5 active:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed",
    destructive: "bg-error text-white hover:bg-error/90 active:bg-error/80 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
