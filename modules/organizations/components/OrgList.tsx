'use client';

import { useState } from 'react';
import { Organization, InstituteType } from '../types';
import { useOrganizations, useDeleteOrg } from '../hooks';
import { OrgForm } from './OrgForm';
import { Modal, DataTable, Badge, PageHeader } from '@/shared';
import { Button } from '@/shared/ui/button';
import { useAuth, UserRole } from '@/core/auth';
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

    if (error) {
        return (
            <div className="rounded-2xl border border-error/20 bg-error/5 p-12 text-center">
                <p className="font-black text-error">Failed to load organizations</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">Please check your connection and try again</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Organizations"
                description="Manage provinces, ministries and federations"
                icon={Building2}
                action={
                    isAdmin && (
                        <Button onClick={handleCreate} className="h-11 gap-2 px-6">
                            <Plus className="w-4 h-4" />
                            Create Organization
                        </Button>
                    )
                }
            />

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <DataTable
                    isLoading={isLoading}
                    data={orgs || []}
                    columns={[
                        {
                            header: 'Organization Name',
                            accessor: (org) => (
                                <div className="flex flex-col">
                                    <span className="font-black text-foreground">{org.name_kh}</span>
                                    {org.name_en && (
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{org.name_en}</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            header: 'Type',
                            accessor: (org) => <TypeBadge type={org.type} />,
                        },
                        {
                            header: 'Province / Code',
                            accessor: (org) => (
                                <div className="flex flex-col text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1.5 text-foreground">
                                        <MapPin className="w-3 h-3 text-primary/50" />
                                        {org.province || 'National'}
                                    </span>
                                    {org.code && <span className="mt-0.5 text-[10px] font-black opacity-60">CODE: {org.code}</span>}
                                </div>
                            ),
                        },
                        ...(isAdmin ? [{
                            header: 'Actions',
                            align: 'right' as const,
                            accessor: (org: Organization) => (
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(org)} title="Edit Organization">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(org.id)} title="Delete Organization" className="text-error hover:text-error hover:bg-error/5">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ),
                        }] : []),
                    ]}
                />
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
            variant: 'default' as const,
            icon: Building2
        },
        [InstituteType.MINISTRY]: {
            label: 'Ministry',
            variant: 'info' as const,
            icon: Landmark
        }
    };

    const { label, variant, icon: Icon } = config[type] || { label: type, variant: 'secondary' as const, icon: Building2 };

    return (
        <Badge variant={variant} className="gap-1.5">
            <Icon className="w-3 h-3" />
            {label}
        </Badge>
    );
}
