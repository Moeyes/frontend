"use client";

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  error?: string;
  children: ReactNode;
  icon?: LucideIcon;
  helperText?: string;
}

export function FormField({
  label,
  isRequired = false,
  error,
  children,
  icon: Icon,
  helperText,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {Icon && (
          <Icon className="w-4 h-4 text-primary" />
        )}
        {label}
        {isRequired && <span className="text-error font-bold">*</span>}
      </label>
      <div>{children}</div>
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

interface FormSectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function FormSectionHeader({
  icon: Icon,
  title,
  description,
}: FormSectionHeaderProps) {
  return (
    <div className="mb-6 pb-4 border-b-2 border-primary">
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <Icon className="w-6 h-6 text-primary" />
        )}
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground ml-9">{description}</p>
      )}
    </div>
  );
}

interface FormStatusProps {
  status: "success" | "error" | "warning" | "info";
  message: string;
}

export function FormStatus({ status, message }: FormStatusProps) {
  const bgColorMap = {
    success: "bg-success/10 border-success/30",
    error: "bg-error/10 border-error/30",
    warning: "bg-warning/10 border-warning/30",
    info: "bg-info/10 border-info/30",
  };

  const textColorMap = {
    success: "text-success",
    error: "text-error",
    warning: "text-warning",
    info: "text-info",
  };

  return (
    <div className={`p-4 rounded-lg border ${bgColorMap[status]}`}>
      <p className={`text-sm font-medium ${textColorMap[status]}`}>{message}</p>
    </div>
  );
}
