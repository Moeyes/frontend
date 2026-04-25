'use client';

import { useState } from 'react';
import { Sport } from '../types';
import { useSports } from '../hooks';
import { SportForm } from './SportForm';
import { Modal, DataTable, PageHeader } from '@/shared';
import { Button } from '@/shared/ui/button';
import { useAuth, UserRole } from '@/core/auth';
import { Edit2, Plus, Hash, Type, Eye, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function SportList() {
    const { data: sports, isLoading, error } = useSports();
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;
    const t = useTranslations('sports');
    const tCommon = useTranslations('common');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSport, setEditingSport] = useState<Sport | undefined>(undefined);

    const handleCreate = () => { setEditingSport(undefined); setIsModalOpen(true); };
    const handleEdit = (sport: Sport) => { setEditingSport(sport); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingSport(undefined); };

    if (error) return (
        <div className="rounded-2xl border border-error/20 bg-error/5 p-12 text-center">
            <p className="font-black text-error">{t('failedToLoad')}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{tCommon('connectionError')}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader title={t('title')} description={t('description')} icon={Trophy}
                action={isAdmin && <Button onClick={handleCreate} className="h-11 gap-2 px-6"><Plus className="w-4 h-4" />{t('createSport')}</Button>}
            />
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <DataTable isLoading={isLoading} data={sports || []} columns={[
                    {
                        header: t('columns.sportName'),
                        accessor: (sport) => (
                            <div className="flex flex-col">
                                <span className="font-black text-foreground">{sport.name_kh}</span>
                                {sport.name_en && <span className="text-[10px] text-muted-foreground uppercase font-bold">{sport.name_en}</span>}
                            </div>
                        ),
                    },
                    {
                        header: t('columns.type'),
                        accessor: (sport) => (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Type className="w-3 h-3 text-primary/40" />{sport.sport_type || 'General'}
                            </div>
                        ),
                    },
                    {
                        header: t('columns.categoryCount'),
                        accessor: (sport) => (
                            <div className="flex items-center gap-1.5 text-sm font-black text-primary">
                                <Hash className="w-3.5 h-3.5 opacity-50" />{sport.category_count || 0}
                            </div>
                        ),
                    },
                    {
                        header: tCommon('actions'), align: 'right',
                        accessor: (sport) => (
                            <div className="flex items-center justify-end gap-2">
                                <Link href={`/sports/${sport.id}`}><Button variant="ghost" size="icon-sm"><Eye className="w-4 h-4" /></Button></Link>
                                {isAdmin && <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(sport)}><Edit2 className="w-4 h-4" /></Button>}
                            </div>
                        ),
                    },
                ]} />
            </div>
            {isAdmin && (
                <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSport ? t('editSport') : t('createNewSport')}>
                    <SportForm sport={editingSport} onSuccess={closeModal} onCancel={closeModal} />
                </Modal>
            )}
        </div>
    );
}
