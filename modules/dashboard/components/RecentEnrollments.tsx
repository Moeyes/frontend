import { RecentEnrollment } from '../types';
import { User, Calendar } from 'lucide-react';
import { DataTable, SectionHeader } from '@/shared';
import { useTranslations } from 'next-intl';

interface RecentEnrollmentsProps {
    data: RecentEnrollment[];
}

export function RecentEnrollments({ data }: RecentEnrollmentsProps) {
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');

    return (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md">
            <SectionHeader title={t('recentEnrollments')} icon={Calendar} />
            <div className="flex-1 overflow-y-auto">
                <DataTable
                    data={data}
                    minWidth="min-w-0"
                    emptyMessage={t('noRecentEnrollments')}
                    columns={[
                        {
                            header: t('members'),
                            accessor: (enroll) => (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium leading-relaxed text-foreground">{enroll.kh_name}</p>
                                        <p className="truncate text-xs leading-relaxed text-muted-foreground">{enroll.en_name}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: t('genderDistribution'),
                            accessor: (enroll) => (
                                <div className="flex flex-col">
                                    <p className="text-sm leading-relaxed text-foreground">{enroll.sport_name}</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">{enroll.gender}</p>
                                </div>
                            ),
                        },
                        {
                            header: tCommon('to'),
                            align: 'right',
                            accessor: (enroll) => (
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {new Date(enroll.createdAt).toLocaleDateString()}
                                </p>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
