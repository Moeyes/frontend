"use client";

import { useRequireRole, UserRole } from "@/core/auth";
import { SurveyForm } from "@/modules/survey";

export default function Page() {
  useRequireRole([UserRole.SUPER_ADMIN, UserRole.ORGANIZATION, UserRole.ADMIN]);
  return <SurveyForm />;
}
