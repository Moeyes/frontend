"use client";

import { useRequireRole, FEATURE_ACCESS } from "@/core/auth";
import { ReportsPage } from "@/modules/reports";

export default function Page() {
  useRequireRole(FEATURE_ACCESS.reports);
  return <ReportsPage />;
}
