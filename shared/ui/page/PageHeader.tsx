import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-snug text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm leading-[1.8] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex flex-wrap items-center gap-3">{action}</div>}
    </div>
  );
}
