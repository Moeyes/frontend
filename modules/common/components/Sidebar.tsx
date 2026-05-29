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
  ClipboardList,
  CreditCard,
  FilePieChart,
  LayoutDashboard,
  Layers,
  Trophy,
  Users,
  UserCheck,
} from "lucide-react";
import { useAuth, UserRole } from "@/core/auth";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui";

interface MenuItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

type MenuSections = MenuItem[][];

const COLLAPSED_KEY = "moeys.sidebar.collapsed";

const MENU_BY_ROLE: Partial<Record<UserRole, MenuSections>> = {
  [UserRole.SUPER_ADMIN]: [
    [{ labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard }],
    [
      { labelKey: "events", href: "/events", icon: Calendar },
      { labelKey: "sports", href: "/sports", icon: Trophy },
      { labelKey: "organizations", href: "/organizations", icon: Building2 },
      { labelKey: "federations", href: "/bycategory", icon: Layers },
      { labelKey: "users", href: "/users", icon: Users },
    ],
    [
      { labelKey: "submissions", href: "/participation", icon: UserCheck },
      { labelKey: "reports", href: "/reports", icon: FilePieChart },
    ],
  ],
  [UserRole.ADMIN]: [
    [{ labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard }],
    [
      { labelKey: "events", href: "/events", icon: Calendar },
      { labelKey: "sports", href: "/sports", icon: Trophy },
      { labelKey: "organizations", href: "/organizations", icon: Building2 },
      { labelKey: "federations", href: "/bycategory", icon: Layers },
      { labelKey: "users", href: "/users", icon: Users },
    ],
    [
      { labelKey: "submissions", href: "/participation", icon: UserCheck },
      { labelKey: "reports", href: "/reports", icon: FilePieChart },
    ],
  ],
  [UserRole.ORGANIZATION]: [
    [
      { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { labelKey: "events", href: "/events", icon: Calendar },
    ],
    [
      { labelKey: "bysport", href: "/bysport", icon: ClipboardList },
      { labelKey: "bynumber", href: "/bynumber", icon: UserCheck },
      { labelKey: "athleteRegistration", href: "/register", icon: CreditCard },
      { labelKey: "leaderRegistration", href: "/participation", icon: FilePieChart },
    ],
  ],
  [UserRole.FEDERATION]: [
    [
      { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { labelKey: "events", href: "/events", icon: Calendar },
    ],
    [{ labelKey: "bycategory", href: "/bycategory", icon: Layers }],
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
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

  const sections = useMemo(() => {
    if (!role) return [];
    return MENU_BY_ROLE[role] ?? [];
  }, [role]);

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-border bg-card shadow-sm transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col px-3 py-4",
          collapsed && "items-center",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-border/70 bg-white px-3 py-3 shadow-sm",
            collapsed && "justify-center px-2",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/10">
            <Trophy className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-snug text-foreground">
                ប្រព័ន្ធកីឡា MOEYS
              </p>
              <p className="truncate text-[11px] font-medium leading-relaxed text-muted-foreground">
                {tCommon("dashboard")}
              </p>
            </div>
          )}
        </div>

        <nav className="mt-5 flex-1 space-y-3">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1.5">
              {section.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={t(item.labelKey as never)}
                    title={t(item.labelKey as never)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border-l-4 px-3 py-3 text-sm font-medium leading-relaxed transition-all duration-200",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "border-primary bg-accent text-primary shadow-sm"
                        : "border-transparent text-muted-foreground hover:border-primary/30 hover:bg-accent/60 hover:text-primary",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4.5 w-4.5 shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">
                        {t(item.labelKey as never)}
                      </span>
                    )}
                  </Link>
                );
              })}

              {sectionIndex < sections.length - 1 && !collapsed && (
                <div className="pt-2" />
              )}
              {sectionIndex < sections.length - 1 && collapsed && (
                <div className="mx-auto w-8 border-t border-border pt-2" />
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <Button
            variant="outline"
            size="icon-sm"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="w-full justify-center border-border bg-white text-foreground hover:bg-accent/70"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
