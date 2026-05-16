'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { SelectField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { useAuth } from '@/core/auth';
import { useEvents, useEventSports } from '@/modules/events';
import { eventSportStepSchema, type EventSportStepValues } from '../services/schema';
import { LEADER_ROLES } from '../services/registration.service';

interface EventSportStepProps {
  defaultValues?: Partial<EventSportStepValues>;
  onNext: (values: EventSportStepValues) => void;
}

export function EventSportStep({ defaultValues, onNext }: EventSportStepProps) {
  const t  = useTranslations('registration');
  const tc = useTranslations('common');

  const form = useForm<EventSportStepValues>({
    resolver: zodResolver(eventSportStepSchema),
    defaultValues: { role: 'athlete', ...defaultValues },
  });

  const selectedEventId = form.watch('event_id');
  const selectedRole    = form.watch('role');

  // Gap #11: federation users only see published events they are linked to
  const { user } = useAuth();
  const eventsQuery = useEvents({
    limit:           100,
    organization_id: user?.organization_id ?? undefined,
    status:          user?.role === 'admin' ? undefined : 'PUBLISHED',
  });
  const sportsQuery = useEventSports(selectedEventId ?? 0);

  const eventOptions = (eventsQuery.data?.data ?? []).map((e) => ({
    value: String(e.id),
    label: e.name_kh,
  }));

  // Use sports_id (actual sport ID) as value, not s.id (sports_event join table ID).
  const sportOptions = (sportsQuery.data ?? []).map((s) => ({
    value: String(s.sports_id ?? s.id ?? ''),
    label: s.sport_name ?? '—',
  }));

  const roleOptions = [
    { value: 'athlete', label: t('roles.athlete') },
    { value: 'leader',  label: t('roles.leader') },
  ];

  const leaderRoleOptions = LEADER_ROLES.map((lr) => ({
    value: lr,
    label: t(`leaderRoles.${lr}` as Parameters<typeof t>[0]),
  }));

  const onSubmit = (values: EventSportStepValues) => {
    onNext({
      ...values,
      event_id: Number(values.event_id),
      sport_id: Number(values.sport_id),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <SelectField
        control={form.control as never}
        name="event_id"
        labelKey="registration.selectEvent"
        options={eventOptions}
        required
      />
      <SelectField
        control={form.control as never}
        name="sport_id"
        labelKey="registration.selectSport"
        options={sportOptions}
        required
        disabled={!selectedEventId}
      />
      <SelectField
        control={form.control as never}
        name="role"
        labelKey="registration.fields.role"
        options={roleOptions}
        required
      />
      {selectedRole === 'leader' && (
        <SelectField
          control={form.control as never}
          name="leader_role"
          labelKey="registration.fields.leaderRole"
          options={leaderRoleOptions}
        />
      )}
      <div className="flex justify-end">
        <Button type="submit">{tc('next')} →</Button>
      </div>
    </form>
  );
}
