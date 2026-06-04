"use client";

import { cn } from "@/shared/utils/cn";
import { Landmark, X } from "lucide-react";

interface SidebarBrandProps {
  collapsed: boolean;
  showClose: boolean;
  onMobileClose?: () => void;
}

export function SidebarBrand({ collapsed, showClose, onMobileClose }: SidebarBrandProps) {
  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center gap-3 border-b border-border px-4",
        collapsed && "justify-center px-0",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Landmark className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-foreground">
            ប្រព័ន្ធកីឡា MOEYS
          </p>
          <p className="truncate text-[11px] leading-relaxed text-muted-foreground">
            ក្រសួងអប់រំ យុវជន និងកីឡា
          </p>
        </div>
      )}
      {showClose && (
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close menu"
          className="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
