'use client';

import { useState } from 'react';
import { useRegistrations } from '../hooks';
import { useAuth, usePermissions, CAPABILITIES } from '@/core/auth';
import { Search, Trash2, Edit2, User, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useConfirm } from '@/shared';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function ParticipantList() {
    const { user } = useAuth();
    const { can } = usePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 10;
    const isAdmin = can(CAPABILITIES.CROSS_ORG_ADMIN);
    const organization_id = isAdmin ? undefined : (user?.org_id || undefined);
    const t = useTranslations('registration.list');
    const tCommon = useTranslations('common');

    const { data: registrationsResponse, isLoading, error, deleteRegistration, isDeleting } = useRegistrations({
        search: searchTerm || undefined, organization_id, skip: currentPage * PAGE_SIZE, limit: PAGE_SIZE,
    });

    const registrations = registrationsResponse?.data || [];
    const totalCount = registrationsResponse?.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handleDelete = (id: number) => { if (window.confirm(t('deleteConfirm'))) deleteRegistration(id); };

    if (error) return (
        <div className="p-8 text-center text-error bg-error/10 rounded-lg border border-error/20">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">{t('failedToLoad')}</p>
            <p className="text-sm opacity-80">{error instanceof Error ? error.message : tCommon('connectionError')}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" placeholder={t('searchPlaceholder')} value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <Button variant="outline" className="gap-2 shrink-0"><Filter className="w-4 h-4" />{tCommon('filters')}</Button>
                </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-left border-b border-border">
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('columns.participant')}</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('columns.eventSport')}</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('columns.role')}</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('columns.registered')}</th>
                                <th className="p-4 text-right text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="p-8 h-16 bg-secondary/10"></td></tr>)
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">{t('noParticipants')}</td></tr>
                            ) : (
                                registrations.map((p) => (
                                    <tr key={p.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                                    {p.photo_url ? <Image src={p.photo_url} alt="" fill className="object-cover" /> : <User className="w-5 h-5 text-primary" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">{p.kh_family_name} {p.kh_given_name}</p>
                                                    <p className="text-xs text-muted-foreground uppercase">{p.en_family_name} {p.en_given_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-semibold text-foreground">{p.sport_name || '—'}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-50">{p.event_name || '—'}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.role === 'athlete' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>{p.role}</span>
                                            {p.leader_role && <p className="text-[10px] text-muted-foreground mt-1 ml-1">{p.leader_role}</p>}
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} disabled={isDeleting} className="h-8 w-8 text-muted-foreground hover:text-error"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between bg-secondary/5">
                        <p className="text-xs text-muted-foreground font-medium">
                            {tCommon('showing')} <span className="text-foreground">{currentPage * PAGE_SIZE + 1}</span> {tCommon('to')} <span className="text-foreground">{Math.min((currentPage + 1) * PAGE_SIZE, totalCount)}</span> {tCommon('of')} <span className="text-foreground">{totalCount}</span>
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>{tCommon('previous')}</Button>
                            <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>{tCommon('next')}</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
