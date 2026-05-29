"use client";

import { useRequireRole, UserRole } from "@/core/auth";
import { PageLoadingState } from "@/shared";
import { CardsPage } from "@/modules/cards";

export default function Page() {
  const { isLoading } = useRequireRole([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ORGANIZATION,
  ]);

  if (isLoading) {
    return <PageLoadingState />;
  }

  return <CardsPage />;
}
