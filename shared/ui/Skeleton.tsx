import * as React from "react";

import { cn } from "@/shared/utils/cn";

/**
 * Skeleton — placeholder block for loading states.
 * Use to mirror the shape of content while data is fetching
 * (lists, tables, cards) instead of a bare spinner.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
