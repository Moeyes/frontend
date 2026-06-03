"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FilePieChart,
  Landmark,
  LayoutDashboard,
  Layers,
  ListChecks,
  Trophy,
  Users,
  UserCheck,
  X,
} from "lucide-react";
import { useAuth, FEATURE_ACCESS, type FeatureKey } from "@/core/auth";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui";

interface MenuItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  /** Permission this item requires; drives whether the role sees it. */
  feature: FeatureKey;
}

type MenuSections = MenuItem[][];

const COLLAPSED_KEY = "moeys.sidebar.collapsed";

/**
 * Single ordered menu definition, grouped into visual sections. Each item is
 * tagged with the feature it belongs to; the rendered sidebar is derived by
 * filtering against FEATURE_ACCESS for the current role, so the nav can never
 * show a feature the role isn't allowed to open. SUPER_ADMIN sees everything.
 */
const MENU_SECTIONS: MenuSections = [
  [{ labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard, feature: "dashboard" }],
  [
    { labelKey: "events", href: "/events", icon: Calendar, feature: "events" },
    { labelKey: "sports", href: "/sports", icon: Trophy, feature: "sports" },
    { labelKey: "organizations", href: "/organizations", icon: Building2, feature: "organizations" },
    { labelKey: "federations", href: "/bycategory", icon: Layers, feature: "bycategory" },
    { labelKey: "users", href: "/users", icon: Users, feature: "users" },
  ],
  [
    { labelKey: "bysport", href: "/bysport", icon: ClipboardList, feature: "bysport" },
    { labelKey: "bynumber", href: "/bynumber", icon: UserCheck, feature: "bynumber" },
    { labelKey: "athleteRegistration", href: "/register", icon: CreditCard, feature: "register" },
    { labelKey: "leaderRegistration", href: "/leaderregistration", icon: ClipboardCheck, feature: "leaderregistration" },
  ],
  [
    { labelKey: "registrations", href: "/registrations", icon: ListChecks, feature: "registrations" },
    { labelKey: "submissions", href: "/participation", icon: UserCheck, feature: "participation" },
    { labelKey: "reports", href: "/reports", icon: FilePieChart, feature: "reports" },
  ],
];

interface SidebarProps {
  /** Whether the mobile drawer is open (controlled by the portal layout). */
  mobileOpen?: boolean;
  /** Close the mobile drawer (backdrop tap / link navigation / close button). */
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  const t = useTranslations("nav");
  const [collapsed, setCollapsed] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem(COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {
      // Non-fatal: ignore storage errors.
    }
  }, [collapsed]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const sections = useMemo<MenuSections>(() => {
    if (!role) return [];
    return MENU_SECTIONS.map((section) =>
      section.filter((item) => FEATURE_ACCESS[item.feature].includes(role)),
    ).filter((section) => section.length > 0);
  }, [role]);

  /**
   * Brand + navigation body, shared between the desktop rail and the mobile
   * drawer. `isCollapsed` only applies to the desktop rail; the drawer is
   * always shown expanded.
   */
  const renderNav = (isCollapsed: boolean) => (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className={cn(
            "space-y-1",
            sectionIndex > 0 && "mt-3 border-t border-border pt-3",
          )}
        >
          {section.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={t(item.labelKey as never)}
                title={t(item.labelKey as never)}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center gap-3 rounded-md border-l-4 py-2.5 pr-3 text-sm font-medium leading-relaxed transition-colors duration-150",
                  isCollapsed ? "justify-center border-l-0 px-0" : "pl-2.5",
                  isActive
                    ? "border-primary bg-accent text-primary"
                    : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-primary",
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate">{t(item.labelKey as never)}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const brand = (isCollapsed: boolean, showClose: boolean) => (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center gap-3 border-b border-border px-4",
        isCollapsed && "justify-center px-0",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Landmark className="h-5 w-5" />
      </div>
      {!isCollapsed && (
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

  return (
    <>
      {/* Desktop rail (>= lg): sticky, collapsible */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-[260px]",
        )}
      >
        {brand(collapsed, false)}
        {renderNav(collapsed)}

        {/* Collapse toggle */}
        <div className="shrink-0 border-t border-border p-3">
          <Button
            variant="outline"
            size="icon-sm"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="w-full justify-center text-muted-foreground hover:bg-accent/60 hover:text-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer (< lg): overlay + slide-in panel */}
      <div className={cn("lg:hidden", mobileOpen ? "" : "pointer-events-none")}>
        {/* Backdrop */}
        <div
          onClick={onMobileClose}
          aria-hidden
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-border bg-card shadow-elevated transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {brand(false, true)}
          {renderNav(false)}
        </aside>
      </div>
    </>
  );
}
