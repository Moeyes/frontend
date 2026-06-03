'use client';

import { useState } from 'react';
import { Sport } from '../types';
import { useSports, useDeleteSport } from '../hooks';
import { SportForm } from './SportForm';
import { Modal, DataTable, PageHeader, useConfirm } from '@/shared';
import { Button } from '@/shared/ui/button';
import { useAuth, UserRole } from '@/core/auth';
import { Edit2, Plus, Type, Eye, Trash2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function SportList() {
    const { data: sports, isLoading, error } = useSports();
    const { mutate: deleteSport } = useDeleteSport();
    const { user, hasRole } = useAuth();
    // Sports management is an admin + super_admin capability (see FEATURE_ACCESS).
    const canManage = hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
    // Federation users are scoped to their own sport only.
    const isFederation = hasRole([UserRole.FEDERATION]);
    const visibleSports = (sports || []).filter((s) => !isFederation || s.id === user?.sport_id);
    const t = useTranslations('sports');
    const tCommon = useTranslations('common');
    const confirm = useConfirm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSport, setEditingSport] = useState<Sport | undefined>(undefined);

    const handleCreate = () => { setEditingSport(undefined); setIsModalOpen(true); };
    const handleEdit = (sport: Sport) => { setEditingSport(sport); setIsModalOpen(true); };
    const handleDelete = async (sport: Sport) => { if (await confirm({ message: t('deleteConfirm') })) deleteSport(sport.id); };
    const closeModal = () => { setIsModalOpen(false); setEditingSport(undefined); };

    if (error) return (
        <div className="rounded-lg border border-error/20 bg-error/5 p-12 text-center">
            <p className="font-black text-error">{t('failedToLoad')}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{tCommon('connectionError')}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader title={t('title')} description={t('description')} icon={Trophy}
                action={canManage && <Button onClick={handleCreate} className="h-11 gap-2 px-6"><Plus className="w-4 h-4" />{t('createSport')}</Button>}
            />
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                <DataTable isLoading={isLoading} data={visibleSports} columns={[
                    {
                        header: t('columns.sportName'),
                        accessor: (sport) => (
                            <span className="font-black text-foreground">{sport.name_kh}</span>
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
                        header: tCommon('actions'), align: 'right',
                        accessor: (sport) => (
                            <div className="flex items-center justify-end gap-2">
                                <Link href={`/sports/${sport.id}`}><Button variant="ghost" size="icon-sm"><Eye className="w-4 h-4" /></Button></Link>
                                {canManage && <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(sport)}><Edit2 className="w-4 h-4" /></Button>}
                                {canManage && <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(sport)} className="text-error hover:text-error hover:bg-error/5"><Trash2 className="w-4 h-4" /></Button>}
                            </div>
                        ),
                    },
                ]} />
            </div>
            {canManage && (
                <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSport ? t('editSport') : t('createNewSport')}>
                    <SportForm sport={editingSport} onSuccess={closeModal} onCancel={closeModal} />
                </Modal>
            )}
        </div>
    );
}
