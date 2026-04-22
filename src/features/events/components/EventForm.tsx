'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Event, EventType, EventCreate } from '../types';
import { useCreateEvent, useUpdateEvent } from '../hooks';
import { Button } from '@/components/ui/button';
import { TextInputField, SelectField } from '@/shared/components/form';

const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().optional().or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  event_type: z.nativeEnum(EventType),
  location: z.string().min(2, 'Location is required'),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
    const isEditing = !!event;
    const { mutate: create, isPending: isCreating } = useCreateEvent();
    const { mutate: update, isPending: isUpdating } = useUpdateEvent();

    const { control, handleSubmit, formState: { errors } } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: event ? {
            name: event.name,
            description: event.description || '',
            start_date: event.start_date,
            end_date: event.end_date,
            event_type: event.event_type,
            location: event.location || '',
        } : {
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            event_type: EventType.NATIONAL,
            location: '',
        }
    });

    const onSubmit = (data: EventFormValues) => {
        if (isEditing) {
            update({
                id: event.id,
                ...data,
            }, {
                onSuccess: () => onSuccess(),
            });
        } else {
            create(data as EventCreate, {
                onSuccess: () => onSuccess(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField
                control={control}
                name="name"
                label="Event Name"
                required
                error={errors.name?.message}
            />
            
            <TextInputField
                control={control}
                name="description"
                label="Description"
                error={errors.description?.message}
            />

            <div className="grid grid-cols-2 gap-4">
                <TextInputField
                    control={control}
                    name="start_date"
                    label="Start Date"
                    type="date"
                    required
                    error={errors.start_date?.message}
                />
                <TextInputField
                    control={control}
                    name="end_date"
                    label="End Date"
                    type="date"
                    required
                    error={errors.end_date?.message}
                />
            </div>

            <SelectField
                control={control}
                name="event_type"
                label="Event Type"
                required
                options={[
                    { value: EventType.NATIONAL, label: 'National' },
                    { value: EventType.UNIVERSITY, label: 'University' },
                    { value: EventType.HIGH_SCHOOL, label: 'High School' },
                    { value: EventType.PRIMARY_SCHOOL, label: 'Primary School' },
                ]}
                error={errors.event_type?.message}
            />

            <TextInputField
                control={control}
                name="location"
                label="Location"
                required
                error={errors.location?.message}
            />

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
                </Button>
            </div>
        </form>
    );
}
