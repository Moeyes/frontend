"use client";

import React, { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon | ReactNode;
  children: ReactNode;
}

export function FormSection({
  title,
  description,
  icon: Icon,
  children,
}: FormSectionProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-b-4 border-l-4 border-l-primary border-border p-6 shadow-sm">
      {/* Section Header with Icon */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {Icon && typeof Icon === "function" && (
            <Icon className="w-5 h-5 text-primary" />
          )}
          <h2 className="text-primary font-black text-xs uppercase tracking-widest py-3 px-4 rounded-lg bg-primary/5">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-sm font-medium text-muted-foreground ml-8">
            {description}
          </p>
        )}
      </div>

      {/* Section Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
