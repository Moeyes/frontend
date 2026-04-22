'use client';

import { useState } from 'react';
import { Sport } from '../types';
import { useSports } from '../hooks';
import { SportForm } from './SportForm';
import { Modal } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { Edit2, Plus, Hash, Type, Eye } from 'lucide-react';
import Link from 'next/link';

export function SportList() {
    const { data: sports, isLoading, error } = useSports();
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSport, setEditingSport] = useState<Sport | undefined>(undefined);

    const handleCreate = () => {
        setEditingSport(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (sport: Sport) => {
        setEditingSport(sport);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSport(undefined);
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
                Failed to load sports. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sports</h1>
                    <p className="text-muted-foreground text-sm">Manage sports and their categories</p>
                </div>
                {isAdmin && (
                    <Button onClick={handleCreate} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Sport
                    </Button>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Sport Name</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Type</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Category Count</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sports?.map((sport) => (
                                <tr key={sport.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{sport.name_kh}</span>
                                            {sport.name_en && (
                                                <span className="text-xs text-muted-foreground">{sport.name_en}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Type className="w-3 h-3" />
                                            {sport.sport_type || 'General'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-sm font-medium">
                                            <Hash className="w-3 h-3 text-primary" />
                                            {sport.category_count || 0}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/sports/${sport.id}`}>
                                                <button
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleEdit(sport)}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="Edit Sport"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {sports?.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No sports found.
                    </div>
                )}
            </div>

            {isAdmin && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editingSport ? 'Edit Sport' : 'Create New Sport'}
                >
                    <SportForm
                        sport={editingSport}
                        onSuccess={closeModal}
                        onCancel={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}
