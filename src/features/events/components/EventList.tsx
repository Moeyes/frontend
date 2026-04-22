'use client';

import { useState } from 'react';
import { Event, EventType } from '../types';
import { useEvents, useDeleteEvent } from '../hooks';
import { EventForm } from './EventForm';
import { Modal } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { Edit2, Trash2, Plus, Calendar, MapPin, Tag, Eye } from 'lucide-react';
import Link from 'next/link';

export function EventList() {
    const { data: events, isLoading, error } = useEvents();
    const { mutate: deleteEvent } = useDeleteEvent();
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

    const handleCreate = () => {
        setEditingEvent(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleDelete = (eventId: number) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            deleteEvent(eventId);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(undefined);
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
                Failed to load events. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Events</h1>
                    <p className="text-muted-foreground text-sm">View and manage sports events</p>
                </div>
                {isAdmin && (
                    <Button onClick={handleCreate} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Event
                    </Button>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Event Name</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Type</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Dates</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground">Location</th>
                                <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {events?.map((event) => (
                                <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{event.name}</span>
                                            {event.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">{event.description}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <TypeBadge type={event.event_type} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                {event.start_date}
                                            </span>
                                            <span className="ml-4.5">to {event.end_date}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            {event.location || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/events/${event.id}`}>
                                                <button
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(event)}
                                                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="Edit Event"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(event.id)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {events?.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No events found.
                    </div>
                )}
            </div>

            {isAdmin && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editingEvent ? 'Edit Event' : 'Create New Event'}
                >
                    <EventForm
                        event={editingEvent}
                        onSuccess={closeModal}
                        onCancel={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}

function TypeBadge({ type }: { type: EventType }) {
    const config = {
        [EventType.NATIONAL]: {
            label: 'National',
            className: 'bg-primary/10 text-primary border-primary/20',
        },
        [EventType.UNIVERSITY]: {
            label: 'University',
            className: 'bg-info/10 text-info border-info/20',
        },
        [EventType.HIGH_SCHOOL]: {
            label: 'High School',
            className: 'bg-warning/10 text-warning border-warning/20',
        },
        [EventType.PRIMARY_SCHOOL]: {
            label: 'Primary School',
            className: 'bg-success/10 text-success border-success/20',
        }
    };

    const { label, className } = config[type] || { label: type, className: 'bg-secondary text-muted-foreground border-border' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>
            <Tag className="w-3 h-3" />
            {label}
        </span>
    );
}
