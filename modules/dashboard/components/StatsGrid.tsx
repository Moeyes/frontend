import { Users, Trophy, Building2 } from 'lucide-react';
import { DashboardStats } from '../types';
import { StatCard } from '@/shared';

interface StatsGridProps {
    stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    const items = [
        { label: 'Total Participants', value: stats.participants, icon: Users, color: 'blue' as const },
        { label: 'Active Events', value: stats.events, icon: Trophy, color: 'amber' as const },
        { label: 'Organizations', value: stats.organizations, icon: Building2, color: 'emerald' as const },
        { label: 'Total Sports', value: stats.sports, icon: Trophy, color: 'purple' as const },
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
