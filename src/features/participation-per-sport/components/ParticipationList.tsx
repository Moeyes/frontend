/**
 * ParticipationList Component
 */

'use client';

import { useState } from 'react';
import { useParticipations, useParticipationMutation } from '../hooks';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { Trash2, Trophy, Building2, User, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ParticipationList() {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 10;

    const isAdmin = user?.role === UserRole.ADMIN;
    const organization_id = isAdmin ? undefined : (user?.org_id || undefined);

    const { data: response, isLoading, error } = useParticipations({
        organization_id,
        skip: currentPage * PAGE_SIZE,
        limit: PAGE_SIZE,
    });

    const { remove, isRemoving } = useParticipationMutation();

    const participations = response?.data || [];
    const totalCount = response?.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to remove this participation entry?')) {
            remove(id);
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center text-error bg-error/10 rounded-xl border border-error/20">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Failed to load participations</p>
                <p className="text-sm opacity-80">
                    {error instanceof Error ? error.message : 'Please try again later'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Participation Per Sport</h2>
                <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Participation
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-left border-b border-border">
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Participant</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Event</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Sport & Category</th>
                                <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Registered</th>
                                {isAdmin && (
                                    <th className="p-4 text-right text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={isAdmin ? 5 : 4} className="p-8 h-16 bg-secondary/10"></td>
                                    </tr>
                                ))
                            ) : participations.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="p-12 text-center text-muted-foreground italic">
                                        No participation records found
                                    </td>
                                </tr>
                            ) : (
                                participations.map((p) => (
                                    <tr key={p.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">{p.participant_name || `Enroll #${p.enroll_id}`}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{p.org_name || 'Organization'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                                <p className="text-xs text-foreground font-medium">{p.event_name || `Event #${p.event_id}`}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-3 h-3 text-primary" />
                                                <p className="text-xs text-foreground font-medium">{p.sport_name || `Sport #${p.sport_id}`}</p>
                                            </div>
                                            {p.category_name && (
                                                <p className="text-[10px] text-muted-foreground ml-5">{p.category_name}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </td>
                                        {isAdmin && (
                                            <td className="p-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(p.id)}
                                                    disabled={isRemoving}
                                                    className="h-8 w-8 text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between bg-secondary/5">
                        <p className="text-xs text-muted-foreground font-medium">
                            Showing <span className="text-foreground">{currentPage * PAGE_SIZE + 1}</span> to <span className="text-foreground">{Math.min((currentPage + 1) * PAGE_SIZE, totalCount)}</span> of <span className="text-foreground">{totalCount}</span> records
                        </p>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
