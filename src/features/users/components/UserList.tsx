'use client';

import { useState } from 'react';
import { User, UserRole } from '@/features/auth/types';
import { useUsers, useDeleteUser } from '../hooks';
import { UserForm } from './UserForm';
import { Modal } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, UserPlus, Shield, User as UserIcon, Building2, Landmark } from 'lucide-react';

export function UserList() {
    const { data: users, isLoading, error } = useUsers();
    const { mutate: deleteUser } = useDeleteUser();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    const handleCreate = () => {
        setEditingUser(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(undefined);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                Failed to load users. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground text-sm">Manage system users and their roles</p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create User
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-sm text-muted-foreground">User</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Email</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Role</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Organization ID</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users?.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{user.khmer_name || user.username}</span>
                                            <span className="text-xs text-muted-foreground">{user.english_name || user.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                                    <td className="p-4">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">{user.org_id || '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users?.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No users found. Create one to get started.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingUser ? 'Edit User' : 'Create New User'}
            >
                <UserForm
                    user={editingUser}
                    onSuccess={closeModal}
                    onCancel={closeModal}
                />
            </Modal>
        </div>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const config = {
        [UserRole.ADMIN]: {
            label: 'Admin',
            className: 'bg-primary/10 text-primary border-primary/20',
            icon: Shield
        },
        [UserRole.ORGANIZATION]: {
            label: 'Organization',
            className: 'bg-info/10 text-info border-info/20',
            icon: Building2
        },
        [UserRole.FEDERATION]: {
            label: 'Federation',
            className: 'bg-warning/10 text-warning border-warning/20',
            icon: Landmark
        },
        [UserRole.GUEST]: {
            label: 'Guest',
            className: 'bg-secondary text-muted-foreground border-border',
            icon: UserIcon
        }
    };

    const { label, className, icon: Icon } = config[role] || config[UserRole.GUEST];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}
