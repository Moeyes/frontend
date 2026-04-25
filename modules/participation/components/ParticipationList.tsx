'use client';

import { useState } from 'react';
import { useParticipations, useParticipationMutation } from '../hooks';
import { useAuth, UserRole } from '@/core/auth';
import { Trash2, Trophy, Building2, User, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { DataTable, SectionHeader } from '@/shared';
import { useTranslations } from 'next-intl';
import type { ParticipationPerSport } from '../types';

export function ParticipationList() {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 10;
    const isAdmin = user?.role === UserRole.ADMIN;
    const organization_id = isAdmin ? undefined : (user?.org_id || undefined);
    const t = useTranslations('participation');
    const tCommon = useTranslations('common');

    const { data: response, isLoading, error } = useParticipations({ organization_id, skip: currentPage * PAGE_SIZE, limit: PAGE_SIZE });
    const { remove, isRemoving } = useParticipationMutation();

    const participations = response?.data || [];
    const totalCount = response?.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handleDelete = (id: number) => { if (window.confirm(t('deleteConfirm'))) remove(id); };

    if (error) return (
        <div className="p-12 text-center text-error bg-error/5 rounded-2xl border border-error/10">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-black text-lg uppercase tracking-tight">{t('failedToLoad')}</p>
            <p className="text-sm font-medium opacity-60 mt-1">{tCommon('connectionError')}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
                <SectionHeader title={t('records.title')} subtitle={t('records.subtitle')} icon={Trophy}
                    action={<Button size="sm" className="h-9 gap-2 px-4 shadow-sm"><Plus className="w-4 h-4" />{t('addRecord')}</Button>}
                />
                <DataTable isLoading={isLoading} data={participations} columns={[
                    {
                        header: t('columns.participant'),
                        accessor: (p) => (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><User className="w-4.5 h-4.5 text-primary" /></div>
                                <div>
                                    <p className="font-black text-foreground text-sm tracking-tight">{p.participant_name || `Enroll #${p.enroll_id}`}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.org_name || 'Organization'}</p>
                                </div>
                            </div>
                        ),
                    },
                    {
                        header: t('columns.event'),
                        accessor: (p) => (
                            <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-primary/40" />
                                <p className="text-xs text-foreground font-black uppercase tracking-tight">{p.event_name || `Event #${p.event_id}`}</p>
                            </div>
                        ),
                    },
                    {
                        header: t('columns.sportCategory'),
                        accessor: (p) => (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5 text-primary" /><p className="text-xs text-foreground font-black uppercase tracking-tight">{p.sport_name || `Sport #${p.sport_id}`}</p></div>
                                {p.category_name && <p className="text-[10px] font-bold text-muted-foreground ml-5.5 uppercase opacity-60">{p.category_name}</p>}
                            </div>
                        ),
                    },
                    {
                        header: t('columns.registered'),
                        accessor: (p) => <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</div>,
                    },
                    ...(isAdmin ? [{
                        header: tCommon('actions'), align: 'right' as const,
                        accessor: (p: ParticipationPerSport) => (
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(p.id)} disabled={isRemoving} className="text-muted-foreground hover:text-error hover:bg-error/5 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        ),
                    }] : []),
                ]} />
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            {tCommon('showing')} <span className="text-foreground">{currentPage * PAGE_SIZE + 1}</span> {tCommon('to')} <span className="text-foreground">{Math.min((currentPage + 1) * PAGE_SIZE, totalCount)}</span> {tCommon('of')} <span className="text-foreground">{totalCount}</span>
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="xs" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="h-8 font-black uppercase">{tCommon('previous')}</Button>
                            <Button variant="outline" size="xs" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="h-8 font-black uppercase">{tCommon('next')}</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
