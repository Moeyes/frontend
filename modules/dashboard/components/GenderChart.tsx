import { GenderDistribution } from '../types';
import { SectionHeader } from '@/shared';
import { PieChart } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GenderChartProps {
    data: GenderDistribution;
}

export function GenderChart({ data }: GenderChartProps) {
    const t = useTranslations('dashboard');
    const total = data.male + data.female + data.other;

    if (total === 0) return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col h-full">
            <SectionHeader title={t('genderDistribution')} icon={PieChart} />
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground italic text-xs font-medium">{t('noOrganizationData')}</div>
        </div>
    );

    const malePerc = (data.male / total) * 100;
    const femalePerc = (data.female / total) * 100;
    const otherPerc = (data.other / total) * 100;

    const size = 180;
    const center = size / 2;
    const radius = 65;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    const maleOffset = 0;
    const femaleOffset = (malePerc / 100) * circumference;
    const otherOffset = ((malePerc + femalePerc) / 100) * circumference;

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col items-center transition-all hover:shadow-md h-full">
            <SectionHeader title={t('genderDistribution')} icon={PieChart} className="w-full" />
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
                <div className="relative w-45 h-45">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                        <circle cx={center} cy={center} r={radius} fill="transparent" stroke="var(--chart-slate)" strokeWidth={strokeWidth} strokeDasharray={`${(otherPerc / 100) * circumference} ${circumference}`} strokeDashoffset={-otherOffset} className="transition-all duration-1000" />
                        <circle cx={center} cy={center} r={radius} fill="transparent" stroke="var(--chart-pink)" strokeWidth={strokeWidth} strokeDasharray={`${(femalePerc / 100) * circumference} ${circumference}`} strokeDashoffset={-femaleOffset} className="transition-all duration-1000" />
                        <circle cx={center} cy={center} r={radius} fill="transparent" stroke="var(--chart-blue)" strokeWidth={strokeWidth} strokeDasharray={`${(malePerc / 100) * circumference} ${circumference}`} strokeDashoffset={-maleOffset} className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-foreground tracking-tighter">{total}</span>
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">{t('members')}</span>
                    </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-50">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-(--chart-blue)" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{t('male')}: {malePerc.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-(--chart-pink)" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{t('female')}: {femalePerc.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-(--chart-slate)" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{t('other')}: {otherPerc.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
