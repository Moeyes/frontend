'use client';

import { useState } from 'react';
import { useEventSportOrgs, useAddOrgToEventSport, useDeleteEventSportOrgLink, useAllOrganizations } from '../hooks';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { Plus, Trash2, Building2, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EventSportOrgManagerProps {
    eventId: number;
    sportId: number;
    sportName: string;
}

export function EventSportOrgManager({ eventId, sportId, sportName }: EventSportOrgManagerProps) {
    const { data: sportOrgs, isLoading: loadingOrgs } = useEventSportOrgs(eventId, sportId);
    const { data: allOrgs } = useAllOrganizations();
    const { mutate: addOrg, isPending: adding } = useAddOrgToEventSport();
    const { mutate: deleteLink } = useDeleteEventSportOrgLink();
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;

    const [newOrgId, setNewOrgId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleAdd = () => {
        if (!newOrgId) return;
        addOrg({ event_id: eventId, sport_id: sportId, org_id: Number(newOrgId) }, {
            onSuccess: () => setNewOrgId('')
        });
    };

    const handleRemove = (orgId: number) => {
        if (window.confirm('Are you sure you want to remove this organization from this sport?')) {
            deleteLink({ event_id: eventId, sport_id: sportId, org_id: orgId });
        }
    };

    const filteredAvailableOrgs = allOrgs?.filter(o => {
        const isNotAdded = !sportOrgs?.some(so => so.id === o.id);
        const matchesSearch = o.name_kh.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             o.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             o.code?.toLowerCase().includes(searchTerm.toLowerCase());
        return isNotAdded && matchesSearch;
    }).slice(0, 50) || []; // Limit to 50 for performance

    if (loadingOrgs) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Organizations for {sportName}
                    </h3>
                    <p className="text-sm text-muted-foreground">Manage which organizations can register for this sport</p>
                </div>
                {isAdmin && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                            <div className="relative w-full sm:w-[300px]">
                                <Select value={newOrgId} onValueChange={(val) => setNewOrgId(val || '')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select organization..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="px-2 py-2 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search..."
                                                    className="pl-8 h-9"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {filteredAvailableOrgs.map(o => (
                                            <SelectItem key={o.id} value={o.id.toString()}>
                                                {o.name_kh} {o.code ? `(${o.code})` : ''}
                                            </SelectItem>
                                        ))}
                                        {filteredAvailableOrgs.length === 0 && (
                                            <div className="p-4 text-center text-sm text-muted-foreground">No matches</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAdd} disabled={!newOrgId || adding} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="p-4 font-semibold text-sm">Organization Name</th>
                            <th className="p-4 font-semibold text-sm">Code</th>
                            <th className="p-4 font-semibold text-sm">Type</th>
                            {isAdmin && <th className="p-4 font-semibold text-sm text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sportOrgs?.map((org) => (
                            <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 text-sm font-medium">{org.name_kh}</td>
                                <td className="p-4 text-sm text-muted-foreground">{org.code || '-'}</td>
                                <td className="p-4 text-sm text-muted-foreground">{org.type || '-'}</td>
                                {isAdmin && (
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleRemove(org.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                            title="Remove from sport"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {sportOrgs?.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-muted-foreground text-sm">
                                    No organizations assigned to this sport yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
