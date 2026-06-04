"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { FeatureKey } from "@/core/auth";

interface MenuItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  feature: FeatureKey;
}

type MenuSections = MenuItem[][];

interface SidebarNavProps {
  sections: MenuSections;
  collapsed: boolean;
  onMobileClose?: () => void;
}

export function SidebarNav({ sections, collapsed, onMobileClose }: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
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
                  collapsed ? "justify-center border-l-0 px-0" : "pl-2.5",
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
                {!collapsed && (
                  <span className="truncate">{t(item.labelKey as never)}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
