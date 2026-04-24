'use client';

import React, { useEffect, useState } from 'react';
import { useSurvey } from '../../hooks';
import { fetchEvents } from '../../services';
import type { Event } from '../../types';

export default function SurveyEventStep() {
    const { form } = useSurvey();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadEvents = async () => {
            setIsLoading(true);
            try {
                const data = await fetchEvents();
                setEvents(data);
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();
    }, []);

    const handleSelectEvent = (event: Event) => {
        form.setValue('eventId', event.id);
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading events...</div>;
    }

    const eventId = form.watch('eventId');

    return (
        <div>
            <p className="text-sm text-slate-600 mb-6">
                Select an event to register your organization for participation.
            </p>

            {events.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No events available</div>
            ) : (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <button
                            key={event.id}
                            onClick={() => handleSelectEvent(event)}
                            className={`p-4 text-left border rounded-lg transition-all ${eventId === event.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <h3 className="font-semibold text-slate-900">{event.name_kh}</h3>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
