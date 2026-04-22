/**
 * StatsGrid Component
 */

'use client';

import { Users, Trophy, Building2 } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsGridProps {
    stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    const items = [
        { label: 'Total Participants', value: stats.participants, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Events', value: stats.events, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Organizations', value: stats.organizations, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Total Sports', value: stats.sports, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
                <div key={idx} className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${item.bg}`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-foreground">{item.value.toLocaleString()}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">{item.label}</p>
                </div>
            ))}
        </div>
    );
}
