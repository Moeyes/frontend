'use client';

import { LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAuth, useRequireAuth } from '@/core/auth';
import { PageLoadingState, PageShell, PageHeader, Badge } from '@/shared';
import { useDashboard } from '../hooks/useDashboard';
import { GenderChart } from './GenderChart';
import { RecentEnrollments } from './RecentEnrollments';
import { StatsGrid } from './StatsGrid';
import { TopOrgsTable } from './TopOrgsTable';
import { useTranslations } from 'next-intl';

export function DashboardPage() {
    const { user, logout } = useAuth();
    useRequireAuth();
    const { data, isLoading, error } = useDashboard();
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');

    if (!user) return null;

    return (
        <PageShell size="wide">
            <PageHeader
                title={t('title')}
                description={t('welcomeBack', { name: user.khmer_name || user.english_name })}
                icon={LayoutDashboard}
                action={
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" size="md" className="h-11 px-6 bg-secondary/50">
                            <span className="mr-2 opacity-50">{tCommon('role')}:</span>
                            {user.role}
                        </Badge>
                        <Button onClick={logout} variant="outline" size="sm" className="h-11 gap-2 px-6">
                            <LogOut className="h-4 w-4" />
                            {tCommon('signOut')}
                        </Button>
                    </div>
                }
            />

            {isLoading ? (
                <PageLoadingState label={t('loadingDashboard')} />
            ) : error ? (
                <div className="rounded-2xl border border-error/20 bg-error/5 p-12 text-center">
                    <p className="font-bold text-error">{t('failedToLoad')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{tCommon('connectionError')}</p>
                </div>
            ) : data ? (
                <>
                    <StatsGrid stats={data.stats} />
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <GenderChart data={data.genderDistribution} />
                        <TopOrgsTable data={data.topOrganizations} />
                        <RecentEnrollments data={data.recentEnrollments} />
                    </div>
                </>
            ) : null}
        </PageShell>
    );
}
