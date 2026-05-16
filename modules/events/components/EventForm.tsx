'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { TextInputField, SelectField, DateField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { parseApiError } from '@/core/api/client';
import { eventSchema, type EventFormValues } from '../services/schema';
import { EVENT_TYPES, EVENT_TYPE_KEY, type EventPublic, type EventCreate, type EventUpdate } from '../services/events.service';
import { useCreateEvent } from '../hooks/useCreateEvent';
import { useUpdateEvent } from '../hooks/useUpdateEvent';

interface EventFormProps {
  mode: 'create' | 'edit';
  event?: EventPublic;
  onSuccess: (event: EventPublic) => void;
}

export function EventForm({ mode, event, onSuccess }: EventFormProps) {
  const t  = useTranslations('events');
  const tc = useTranslations('common');

  const typeOptions = EVENT_TYPES.map((val) => ({
    value: val,
    label: t(`types.${EVENT_TYPE_KEY[val]}` as Parameters<typeof t>[0]),
  }));

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name_kh:             event?.name_kh            ?? '',
      type:                event?.type               ?? ('' as EventFormValues['type']),
      description:         event?.description        ?? '',
      start_date:          event?.start_date         ?? '',
      end_date:            event?.end_date            ?? '',
      location:            event?.location            ?? '',
      open_register_date:  event?.open_register_date  ?? '',
      close_register_date: event?.close_register_date ?? '',
    },
  });

  useEffect(() => {
    if (event) form.reset({ ...event, description: event.description ?? '', location: event.location ?? '' });
  }, [event, form]);

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent(event?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: EventFormValues) => {
    const clean = {
      ...values,
      start_date:          values.start_date          || null,
      end_date:            values.end_date             || null,
      location:            values.location             || null,
      description:         values.description          || null,
      open_register_date:  values.open_register_date   || null,
      close_register_date: values.close_register_date  || null,
    };
    try {
      const result = mode === 'create'
        ? await createMutation.mutateAsync(clean as EventCreate)
        : await updateMutation.mutateAsync(clean as EventUpdate);
      toast.success(mode === 'create' ? t('createEvent') : tc('save'));
      onSuccess(result);
    } catch (err: unknown) {
      if (err instanceof Response) {
        const fieldErrors = await parseApiError(err);
        Object.entries(fieldErrors).forEach(([field, msg]) =>
          form.setError(field as keyof EventFormValues, { message: msg })
        );
      } else {
        form.setError('root', { message: tc('somethingWentWrong') });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl" noValidate>
      {form.formState.errors.root && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {form.formState.errors.root.message}
        </div>
      )}

      <TextInputField control={form.control} name="name_kh" labelKey="events.eventName" required />
      <SelectField control={form.control} name="type" labelKey="events.eventType" options={typeOptions} required />
      <TextInputField control={form.control} name="location" labelKey="events.location" />
      <TextInputField control={form.control} name="description" labelKey="events.description_field" />

      <div className="grid grid-cols-2 gap-4">
        <DateField control={form.control} name="start_date" labelKey="events.startDate" />
        <DateField control={form.control} name="end_date"   labelKey="events.endDate" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <DateField control={form.control} name="open_register_date"  labelKey="events.registrationOpenDate" />
        <DateField control={form.control} name="close_register_date" labelKey="events.registrationCloseDate" />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} loading={isPending}>
          {mode === 'create' ? t('createEvent') : tc('save')}
        </Button>
      </div>
    </form>
  );
}
