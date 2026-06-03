import {
  Users,
  Building2,
  FileText,
  Calendar,
  UserCheck,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { DashboardStats } from "../types";
import { StatCard } from "@/shared";
import { useAuth, UserRole } from "@/core/auth";
import { useTranslations } from "next-intl";

interface StatsGridProps {
  stats: DashboardStats;
}

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

/**
 * Role-aware stat cards. Presentation only — every role reads the same
 * DashboardStats fields returned by useDashboard; only the framing/labels differ.
 */
export function StatsGrid({ stats }: StatsGridProps) {
  const t = useTranslations("dashboard.stats");
  const { role } = useAuth();

  const athletes = stats.athletes ?? stats.participants;

  let items: StatItem[];

  if (role === UserRole.ORGANIZATION) {
    items = [
      { label: t("myEvents"), value: stats.events, icon: Calendar },
      { label: t("mySubmissions"), value: stats.registrations ?? 0, icon: FileText },
      { label: t("myAthletes"), value: athletes, icon: Users },
      { label: t("myLeaders"), value: stats.leaders ?? 0, icon: UserCheck },
    ];
  } else if (role === UserRole.FEDERATION) {
    items = [
      { label: t("assignedEvents"), value: stats.events, icon: Calendar },
      { label: t("categorySurveys"), value: stats.registrations ?? 0, icon: ClipboardList },
      { label: t("myAthletes"), value: athletes, icon: Users },
    ];
  } else {
    items = [
      { label: t("totalEvents"), value: stats.events, icon: Calendar },
      { label: t("totalOrganizations"), value: stats.organizations, icon: Building2 },
      { label: t("pendingSubmissions"), value: stats.registrations ?? 0, icon: FileText },
      { label: t("totalAthletesRegistered"), value: athletes, icon: Users },
    ];
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => (
        <StatCard
          key={idx}
          label={item.label}
          value={item.value}
          icon={item.icon}
          color="primary"
        />
      ))}
    </div>
  );
}
