"use client";

import { useRequireRole, UserRole } from "@/core/auth";
import { ReportsPage } from "@/modules/reports";

export default function Page() {
  useRequireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZATION]);
  return <ReportsPage />;
}
