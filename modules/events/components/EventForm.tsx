'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Event, EventType, EventCreate } from '../types';
import { useCreateEvent, useUpdateEvent } from '../hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField, SelectField } from '@/shared/form';
import { FormSection } from '@/shared';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

const eventSchema = z.object({
    name: z.string().min(3),
    description: z.string().optional().or(z.literal('')),
    start_date: z.string().min(1),
    end_date: z.string().min(1),
    event_type: z.nativeEnum(EventType),
    location: z.string().min(2),
    open_register_date: z.string().optional().or(z.literal('')),
    close_register_date: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.end_date < data.start_date)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End date must be after start date', path: ['end_date'] });
    if (data.open_register_date && data.close_register_date && data.close_register_date < data.open_register_date)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Close date must be after open date', path: ['close_register_date'] });
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
    const t = useTranslations('events');
    const tCommon = useTranslations('common');

    const { control, handleSubmit, formState: { errors } } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: event ? {
            name: event.name, description: event.description || '',
            start_date: event.start_date, end_date: event.end_date,
            event_type: event.event_type, location: event.location || '',
            open_register_date: event.open_register_date || '',
            close_register_date: event.close_register_date || '',
        } : { name: '', description: '', start_date: '', end_date: '', event_type: EventType.NATIONAL, location: '', open_register_date: '', close_register_date: '' }
    });

    const onSubmit = (data: EventFormValues) => {
        if (isEditing) update({ id: event.id, ...data }, { onSuccess });
        else create(data as EventCreate, { onSuccess });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormSection title={t('eventName')} description={t('description_field')} icon={Calendar}>
                <div className="space-y-3">
                    <TextInputField control={control} name="name" label={t('eventName')} required error={errors.name?.message} />
                    <TextInputField control={control} name="description" label={t('description_field')} error={errors.description?.message} />
                </div>
            </FormSection>

            <FormSection title={t('registerWindow')} description="" icon={Calendar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInputField control={control} name="start_date" label={t('startDate')} type="date" required error={errors.start_date?.message} />
                    <TextInputField control={control} name="end_date" label={t('endDate')} type="date" required error={errors.end_date?.message} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <TextInputField control={control} name="open_register_date" label={t('registrationOpenDate')} type="date" error={errors.open_register_date?.message} />
                    <TextInputField control={control} name="close_register_date" label={t('registrationCloseDate')} type="date" error={errors.close_register_date?.message} />
                </div>
            </FormSection>

            <FormSection title={t('eventType')} description="" icon={Calendar}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField control={control} name="event_type" label={t('eventType')} required options={[
                        { value: EventType.NATIONAL, label: t('types.NATIONAL') },
                        { value: EventType.UNIVERSITY, label: t('types.UNIVERSITY') },
                        { value: EventType.HIGH_SCHOOL, label: t('types.HIGH_SCHOOL') },
                        { value: EventType.PRIMARY_SCHOOL, label: t('types.PRIMARY_SCHOOL') },
                    ]} error={errors.event_type?.message} />
                    <TextInputField control={control} name="location" label={t('location')} required error={errors.location?.message} />
                </div>
            </FormSection>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? tCommon('saving') : isEditing ? t('editEvent') : t('createEvent')}
                </Button>
            </div>
        </form>
    );
}
