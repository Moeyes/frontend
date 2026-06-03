"use client";

import { useRequireRole, FEATURE_ACCESS } from "@/core/auth";
import { SurveyForm } from "@/modules/survey";

export default function Page() {
  useRequireRole(FEATURE_ACCESS.bysport);
  return <SurveyForm />;
}
