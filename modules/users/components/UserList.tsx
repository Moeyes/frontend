'use client';

import { useState } from 'react';
import type { User } from '@/core/auth';
import { UserRole } from '@/core/auth';
import { useUsers, useDeleteUser } from '../hooks';
import { UserForm } from './UserForm';
import { Modal, DataTable, Badge, PageHeader } from '@/shared';
import { Button } from '@/shared/ui/button';
import { Edit2, Trash2, UserPlus, Shield, User as UserIcon, Building2, Landmark, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function UserList() {
    const { data: users, isLoading, error } = useUsers();
    const { mutate: deleteUser } = useDeleteUser();
    const t = useTranslations('users');
    const tCommon = useTranslations('common');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    const handleCreate = () => { setEditingUser(undefined); setIsModalOpen(true); };
    const handleEdit = (user: User) => { setEditingUser(user); setIsModalOpen(true); };
    const handleDelete = (userId: string) => { if (window.confirm(t('deleteConfirm'))) deleteUser(userId); };
    const closeModal = () => { setIsModalOpen(false); setEditingUser(undefined); };

    if (error) return (
        <div className="rounded-2xl border border-error/20 bg-error/5 p-12 text-center">
            <p className="font-black text-error">{t('failedToLoad')}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{tCommon('connectionError')}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader title={t('title')} description={t('description')} icon={UserIcon}
                action={<Button onClick={handleCreate} className="h-11 gap-2 px-6"><UserPlus className="w-4 h-4" />{t('createUser')}</Button>}
            />
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <DataTable isLoading={isLoading} data={users || []} columns={[
                    {
                        header: t('columns.user'),
                        accessor: (user) => (
                            <div className="flex flex-col">
                                <span className="font-black text-foreground">{user.khmer_name || user.username}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{user.english_name || user.username}</span>
                            </div>
                        ),
                    },
                    {
                        header: t('columns.email'),
                        accessor: (user) => (
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Mail className="w-3.5 h-3.5 opacity-50" />{user.email}
                            </div>
                        ),
                    },
                    { header: t('columns.role'), accessor: (user) => <RoleBadge role={user.role} /> },
                    {
                        header: t('columns.orgId'),
                        accessor: (user) => (
                            <div className="text-xs font-black text-muted-foreground">
                                {user.org_id ? <span className="bg-muted px-2 py-1 rounded text-[10px]">{user.org_id}</span> : '-'}
                            </div>
                        ),
                    },
                    {
                        header: tCommon('actions'), align: 'right',
                        accessor: (user) => (
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(user)}><Edit2 className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(user.id)} className="text-error hover:text-error hover:bg-error/5"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ),
                    },
                ]} />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? t('editUser') : t('createNewUser')}>
                <UserForm user={editingUser} onSuccess={closeModal} onCancel={closeModal} />
            </Modal>
        </div>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const t = useTranslations('users.roles');
    const config = {
        [UserRole.ADMIN]: { label: t('admin'), variant: 'default' as const, icon: Shield },
        [UserRole.ORGANIZATION]: { label: t('org'), variant: 'info' as const, icon: Building2 },
        [UserRole.FEDERATION]: { label: t('fed'), variant: 'warning' as const, icon: Landmark },
        [UserRole.GUEST]: { label: t('guest'), variant: 'secondary' as const, icon: UserIcon },
    };
    const { label, variant, icon: Icon } = config[role] || config[UserRole.GUEST];
    return <Badge variant={variant} className="gap-1.5"><Icon className="w-3 h-3" />{label}</Badge>;
}
