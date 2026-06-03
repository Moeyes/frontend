/**
 * Portal Layout
 *
 * Wraps all portal routes. Each page declares its own required roles
 * via the ProtectedRoute component so the layout stays clean.
 */

"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/modules/auth";
import { UserRole } from "@/core/auth";
import { Sidebar } from "@/modules/common";
import { TopBar } from "@/shared/layout";

// All portal routes require at least being logged in
const PORTAL_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.ORGANIZATION,
  UserRole.FEDERATION,
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ProtectedRoute requiredRoles={PORTAL_ROLES}>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="min-w-0 flex-1 overflow-y-auto bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
