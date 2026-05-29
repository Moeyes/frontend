import { Users, Trophy, Building2, FileText } from "lucide-react";
import { DashboardStats } from "../types";
import { StatCard } from "@/shared";
import { useTranslations } from "next-intl";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const t = useTranslations("dashboard.stats");

  const items = [
    {
      label: t("totalEvents"),
      value: stats.events,
      icon: Trophy,
      color: "blue" as const,
    },
    {
      label: t("totalOrganizations"),
      value: stats.organizations,
      icon: Building2,
      color: "emerald" as const,
    },
    {
      label: t("pendingSubmissions"),
      value: stats.registrations ?? 0,
      icon: FileText,
      color: "amber" as const,
    },
    {
      label: t("totalAthletesRegistered"),
      value: stats.athletes ?? stats.participants,
      icon: Users,
      color: "purple" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <StatCard
          key={idx}
          label={item.label}
          value={item.value}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </div>
  );
}
