'use client';

import { useState } from 'react';
import { useEventSports, useAddSportToEvent, useRemoveSportFromEvent, useAllSports } from '../hooks';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { Plus, Trash2, Trophy, Loader2 } from 'lucide-react';

interface EventSportManagerProps {
    eventId: number;
    onSelectSport: (sportId: number) => void;
    selectedSportId: number | null;
}

export function EventSportManager({ eventId, onSelectSport, selectedSportId }: EventSportManagerProps) {
    const { data: eventSports, isLoading: loadingSports } = useEventSports(eventId);
    const { data: allSports } = useAllSports();
    const { mutate: addSport, isPending: adding } = useAddSportToEvent();
    const { mutate: removeSport } = useRemoveSportFromEvent();
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;

    const [newSportId, setNewSportId] = useState<string>('');

    const handleAdd = () => {
        if (!newSportId) return;
        addSport({ event_id: eventId, sport_id: Number(newSportId) }, {
            onSuccess: () => setNewSportId('')
        });
    };

    const handleRemove = (sportId: number) => {
        if (window.confirm('Are you sure you want to remove this sport from the event?')) {
            removeSport({ eventId, sportId });
        }
    };

    // Filter out sports already added
    const availableSports = allSports?.filter(
        s => !eventSports?.some(es => es.id === s.id)
    ) || [];

    if (loadingSports) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Event Sports
                </h3>
                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <Select value={newSportId} onValueChange={(val) => setNewSportId(val || '')}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select sport..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSports.map(s => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.name_kh}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAdd} disabled={!newSportId || adding} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventSports?.map((sport) => (
                    <div 
                        key={sport.id}
                        onClick={() => onSelectSport(sport.id)}
                        className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            selectedSportId === sport.id 
                                ? 'border-primary bg-primary/5 shadow-md' 
                                : 'border-border bg-card hover:border-primary/50'
                        }`}
                    >
                        <span className="font-medium">{sport.name_kh}</span>
                        {isAdmin && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(sport.id);
                                }}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {eventSports?.length === 0 && (
                    <p className="text-muted-foreground text-sm col-span-full text-center py-8">
                        No sports assigned to this event yet.
                    </p>
                )}
            </div>
        </div>
    );
}
