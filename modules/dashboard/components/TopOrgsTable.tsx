import { TopOrganization } from '../types';
import { Building2 } from 'lucide-react';
import { SectionHeader } from '@/shared';
import { useTranslations } from 'next-intl';

interface TopOrgsTableProps {
    data: TopOrganization[];
}

export function TopOrgsTable({ data }: TopOrgsTableProps) {
    const t = useTranslations('dashboard');
    const max = data.reduce((m, o) => Math.max(m, o.participants), 0) || 1;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <SectionHeader title={t('topOrganizations')} icon={Building2} />
            <div className="flex-1 overflow-y-auto p-6 pt-4">
                {data.length === 0 ? (
                    <p className="py-8 text-center text-sm leading-relaxed text-muted-foreground">
                        {t('noOrganizationData')}
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {data.map((org, index) => (
                            <li key={`${org.name}-${index}`} className="space-y-1.5">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="flex min-w-0 items-baseline gap-2">
                                        <span className="text-xs text-muted-foreground">{index + 1}.</span>
                                        <span className="truncate text-sm font-medium leading-relaxed text-foreground">
                                            {org.name}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-sm font-semibold text-primary">
                                        {org.participants}
                                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                                            {t('members')}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-700"
                                        style={{ width: `${(org.participants / max) * 100}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
