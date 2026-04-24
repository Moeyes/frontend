'use client';

import { useState } from 'react';
import { Event, EventType } from '../types';
import { useEvents, useDeleteEvent } from '../hooks';
import { EventForm } from './EventForm';
import { Modal, DataTable, Badge, PageHeader } from '@/shared';
import { Button } from '@/shared/ui/button';
import { useAuth, UserRole } from '@/core/auth';
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

    if (error) {
        return (
            <div className="rounded-2xl border border-error/20 bg-error/5 p-12 text-center">
                <p className="font-black text-error">Failed to load events</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">Please check your connection and try again</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Events"
                description="View and manage sports events"
                icon={Calendar}
                action={
                    isAdmin && (
                        <Button onClick={handleCreate} className="h-11 gap-2 px-6">
                            <Plus className="w-4 h-4" />
                            Create Event
                        </Button>
                    )
                }
            />

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <DataTable
                    isLoading={isLoading}
                    data={events || []}
                    columns={[
                        {
                            header: 'Event Name / ឈ្មោះព្រឹត្តិការណ៍',
                            accessor: (event) => (
                                <div className="flex flex-col">
                                    <span className="font-black text-foreground">{event.name}</span>
                                    {event.description && (
                                        <span className="text-[10px] text-muted-foreground line-clamp-1">{event.description}</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            header: 'Type / ប្រភេទ',
                            accessor: (event) => <TypeBadge type={event.event_type} />,
                        },
                        {
                            header: 'Dates / កាលបរិច្ឆេទ',
                            accessor: (event) => (
                                <div className="flex flex-col text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5 text-foreground">
                                        <Calendar className="w-3 h-3 text-primary" />
                                        {event.start_date}
                                    </span>
                                    <span className="mt-0.5 opacity-60">to {event.end_date}</span>
                                </div>
                            ),
                        },
                        {
                            header: 'Location / ទីកន្លែង',
                            accessor: (event) => (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <MapPin className="w-3 h-3 text-primary/50" />
                                    {event.location || 'N/A'}
                                </div>
                            ),
                        },
                        {
                            header: 'Actions',
                            align: 'right',
                            accessor: (event) => (
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/events/${event.id}`}>
                                        <Button variant="ghost" size="icon-sm" title="View Details">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    {isAdmin && (
                                        <>
                                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(event)} title="Edit Event">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(event.id)} title="Delete Event" className="text-error hover:text-error hover:bg-error/5">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
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
    const config: Record<string, { label: string, variant: "default" | "info" | "warning" | "success" | "secondary" }> = {
        [EventType.NATIONAL]: { label: 'National / ថ្នាក់ជាតិ', variant: 'default' },
        [EventType.UNIVERSITY]: { label: 'University / ឧត្តមសិក្សា', variant: 'info' },
        [EventType.HIGH_SCHOOL]: { label: 'High School / មធ្យមសិក្សា', variant: 'warning' },
        [EventType.PRIMARY_SCHOOL]: { label: 'Primary School / បឋមសិក្សា', variant: 'success' },
        'NATIONAL': { label: 'National / ថ្នាក់ជាតិ', variant: 'default' },
        'UNIVERSITY': { label: 'University / ឧត្តមសិក្សា', variant: 'info' },
        'HIGH_SCHOOL': { label: 'High School / មធ្យមសិក្សា', variant: 'warning' },
        'PRIMARY_SCHOOL': { label: 'Primary School / បឋមសិក្សា', variant: 'success' }
    };

    const { label, variant } = config[type] || { label: type || 'Unknown', variant: 'secondary' };

    return (
        <Badge variant={variant} className="gap-1.5 whitespace-nowrap">
            <Tag className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
        </Badge>
    );
}
