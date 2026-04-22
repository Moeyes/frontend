'use client';

import { EventList } from '@/features/events';

/**
 * Events Management Page
 */
export default function EventsPage() {
    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EventList />
        </div>
    );
}
