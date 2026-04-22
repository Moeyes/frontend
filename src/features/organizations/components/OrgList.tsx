'use client';

import { useState } from 'react';
import { Organization, InstituteType } from '../types';
import { useOrganizations, useDeleteOrg } from '../hooks';
import { OrgForm } from './OrgForm';
import { Modal } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { Edit2, Trash2, Plus, Building2, MapPin, Landmark } from 'lucide-react';

export function OrgList() {
    const { data: orgs, isLoading, error } = useOrganizations();
    const { mutate: deleteOrg } = useDeleteOrg();
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | undefined>(undefined);

    const handleCreate = () => {
        setEditingOrg(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (org: Organization) => {
        setEditingOrg(org);
        setIsModalOpen(true);
    };

    const handleDelete = (orgId: number) => {
        if (window.confirm('Are you sure you want to delete this organization?')) {
            deleteOrg({ org_id: orgId });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOrg(undefined);
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
                Failed to load organizations. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
                    <p className="text-muted-foreground text-sm">Manage provinces, ministries and federations</p>
                </div>
                {isAdmin && (
                    <Button onClick={handleCreate} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Organization
                    </Button>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Organization Name</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Type</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Province / Code</th>
                                {isAdmin && <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {orgs?.map((org) => (
                                <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{org.name_kh}</span>
                                            {org.name_en && (
                                                <span className="text-xs text-muted-foreground">{org.name_en}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <TypeBadge type={org.type} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3" />
                                                {org.province || 'National'}
                                            </span>
                                            {org.code && <span className="ml-4.5 text-[10px] font-mono opacity-70">CODE: {org.code}</span>}
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(org)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="Edit Organization"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(org.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                                    title="Delete Organization"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orgs?.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No organizations found.
                    </div>
                )}
            </div>

            {isAdmin && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editingOrg ? 'Edit Organization' : 'Create New Organization'}
                >
                    <OrgForm
                        org={editingOrg}
                        onSuccess={closeModal}
                        onCancel={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}

function TypeBadge({ type }: { type: InstituteType }) {
    const config = {
        [InstituteType.PROVINCE]: {
            label: 'Province',
            className: 'bg-primary/10 text-primary border-primary/20',
            icon: Building2
        },
        [InstituteType.MINISTRY]: {
            label: 'Ministry',
            className: 'bg-info/10 text-info border-info/20',
            icon: Landmark
        }
    };

    const { label, className, icon: Icon } = config[type] || { label: type, className: 'bg-secondary', icon: Building2 };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${className}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}
