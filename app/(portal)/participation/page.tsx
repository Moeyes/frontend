"use client";

import { useRequireRole, FEATURE_ACCESS } from "@/core/auth";
import { ParticipationPage } from "@/modules/participation";

export default function Page() {
  useRequireRole(FEATURE_ACCESS.participation);
  return <ParticipationPage />;
}
