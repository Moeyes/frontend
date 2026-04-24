'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, LayoutDashboard, MapPin, Tag, Trophy } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    ContentPanel,
    DetailHeader,
    PageEmptyState,
    PageLoadingState,
    PageNotFound,
    PageShell,
} from '@/shared';
import { useEventDetail, useEventSports } from '../hooks';
import { EventSportManager } from './EventSportManager';
import { EventSportOrgManager } from './EventSportOrgManager';

interface EventDetailPageProps {
    eventId: number;
}

export function EventDetailPage({ eventId }: EventDetailPageProps) {
    const { data: event, isLoading } = useEventDetail(eventId);
    const { data: eventSports } = useEventSports(eventId);
    const [selectedSportId, setSelectedSportId] = useState<number | null>(null);

    const selectedSportName = eventSports?.find((sport) => sport.sports_id === selectedSportId)?.name_kh || '';

    if (isLoading) {
        return <PageLoadingState />;
    }

    if (!event) {
        return (
            <PageNotFound
                title="Event not found"
                action={
                    <Link href="/events" className="text-primary hover:underline">
                        Back to Events
                    </Link>
                }
            />
        );
    }

    return (
        <PageShell padded={false} size="wide">
            <DetailHeader
                backHref="/events"
                backLabel="Back to Events"
                eyebrow={event.event_type}
                eyebrowIcon={Tag}
                title={event.name}
                meta={
                    <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {event.start_date} to {event.end_date}
                        </span>
                        {event.location && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                            </span>
                        )}
                    </div>
                }
                action={
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 gap-8">
                <ContentPanel>
                    <EventSportManager
                        eventId={eventId}
                        onSelectSport={setSelectedSportId}
                        selectedSportId={selectedSportId}
                    />
                </ContentPanel>

                {selectedSportId ? (
                    <ContentPanel className="min-h-100">
                        <EventSportOrgManager
                            eventId={eventId}
                            sportId={selectedSportId}
                            sportName={selectedSportName}
                        />
                    </ContentPanel>
                ) : (
                    <PageEmptyState
                        icon={Trophy}
                        title="No Sport Selected"
                        description="Select a sport from the list above to manage its participating organizations."
                    />
                )}
            </div>
        </PageShell>
    );
}
