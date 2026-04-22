'use client';

import { use, useState } from 'react';
import { useEventDetail, useEventSports } from '@/features/events/hooks';
import { EventSportManager, EventSportOrgManager } from '@/features/events/components';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, LayoutDashboard, Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';

interface EventDetailPageProps {
    params: Promise<{ event_id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
    const { event_id } = use(params);
    const eventId = Number(event_id);
    
    const { data: event, isLoading: loadingEvent } = useEventDetail(eventId);
    const { data: eventSports } = useEventSports(eventId);
    
    const [selectedSportId, setSelectedSportId] = useState<number | null>(null);

    const selectedSportName = eventSports?.find(s => s.id === selectedSportId)?.name_kh || '';

    if (loadingEvent) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <h1 className="text-2xl font-bold">Event not found</h1>
                <Link href="/events" className="text-primary hover:underline mt-4 inline-block">
                    Back to Events
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col gap-4">
                <Link href="/events" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Events
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                            <Tag className="w-4 h-4" />
                            {event.event_type}
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {event.start_date} to {event.end_date}
                            </span>
                            {event.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                </span>
                            )}
                        </div>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Sports Assignment Section */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <EventSportManager 
                        eventId={eventId} 
                        onSelectSport={setSelectedSportId}
                        selectedSportId={selectedSportId}
                    />
                </div>

                {/* Organization Assignment Section */}
                {selectedSportId ? (
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm min-h-[400px]">
                        <EventSportOrgManager 
                            eventId={eventId} 
                            sportId={selectedSportId}
                            sportName={selectedSportName}
                        />
                    </div>
                ) : (
                    <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center shadow-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-muted rounded-full">
                                <Trophy className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-foreground">No Sport Selected</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Select a sport from the list above to manage its participating organizations.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
