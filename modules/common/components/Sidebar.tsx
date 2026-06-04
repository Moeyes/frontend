"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FilePieChart,
  LayoutDashboard,
  Layers,
  ListChecks,
  Trophy,
  Users,
  UserCheck,
} from "lucide-react";
import { useAuth, FEATURE_ACCESS, type FeatureKey } from "@/core/auth";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui";
import { SidebarNav } from "./SidebarNav";
import { SidebarBrand } from "./SidebarBrand";

interface MenuItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  feature: FeatureKey;
}

type MenuSections = MenuItem[][];

const COLLAPSED_KEY = "moeys.sidebar.collapsed";

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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { role } = useAuth();
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

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-[260px]",
        )}
      >
        <SidebarBrand collapsed={collapsed} showClose={false} />
        <SidebarNav sections={sections} collapsed={collapsed} onMobileClose={onMobileClose} />

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

      <div className={cn("lg:hidden", mobileOpen ? "" : "pointer-events-none")}>
        <div
          onClick={onMobileClose}
          aria-hidden
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-border bg-card shadow-elevated transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarBrand collapsed={false} showClose={true} onMobileClose={onMobileClose} />
          <SidebarNav sections={sections} collapsed={false} onMobileClose={onMobileClose} />
        </aside>
      </div>
    </>
  );
}
