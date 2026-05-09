'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { TextInputField, SelectField, DateField, FileUploadField } from '@/shared/form';
import { Button, SectionHeader } from '@/shared/ui';
import { parseApiError } from '@/core/api/client';
import { computeAgeAtEvent } from '@/core/lib/format';
import { MINOR_AGE_THRESHOLD } from '@/core/config';
import { useEvent, useEventSports } from '@/modules/events';
import { useCloudinaryUpload, LEADER_ROLES } from '@/modules/registration-flow';
import { useEvents } from '@/modules/events';
import { organizerSchema, type OrganizerFormValues } from '../services/schema';
import { useCreateOrganizer } from '../hooks/useCreateOrganizer';
import type { OrganizerRecord } from '../services/participation.service';

interface OrganizerFormProps {
  org?: OrganizerRecord;
  organizationId: number | null;
  onSuccess: () => void;
}

export function OrganizerForm({ org, organizationId, onSuccess }: OrganizerFormProps) {
  const t  = useTranslations('participation');
  const tr = useTranslations('registration');
  const tc = useTranslations('common');
  const upload = useCloudinaryUpload();

  const form = useForm<OrganizerFormValues>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      gender: 'MALE',
      leader_role: '',
      ...(org ? {
        kh_family_name: org.kh_family_name ?? '',
        kh_given_name:  org.kh_given_name  ?? '',
        en_family_name: org.en_family_name ?? '',
        en_given_name:  org.en_given_name  ?? '',
        gender: (org.gender ?? 'MALE') as 'MALE' | 'FEMALE',
        date_of_birth: org.date_of_birth ?? '',
        phone:   org.phone ?? '',
        address: org.address ?? '',
        leader_role: org.leader_role ?? '',
      } : {}),
    },
  });

  const selectedEventId = form.watch('event_id');
  const dateOfBirth     = form.watch('date_of_birth');

  const eventsQuery = useEvents({ limit: 100 });
  const sportsQuery = useEventSports(selectedEventId ?? 0);
  const eventQuery  = useEvent(selectedEventId ?? 0);
  const mutation    = useCreateOrganizer();

  // RED LINE #3 — age computed from event start date, NEVER from new Date()
  const eventStartDate = eventQuery.data?.start_date ?? null;
  const age = (dateOfBirth && eventStartDate)
    ? computeAgeAtEvent(dateOfBirth, eventStartDate)
    : null;
  const isMinor = age !== null ? age < MINOR_AGE_THRESHOLD : null;

  const eventOptions = (eventsQuery.data?.data ?? []).map((e) => ({
    value: String(e.id), label: e.name_kh,
  }));
  const sportOptions = (sportsQuery.data ?? []).map((s) => ({
    value: String(s.id ?? ''), label: s.sport_name ?? '—',
  }));
  const leaderRoleOptions = LEADER_ROLES.map((lr) => ({
    value: lr, label: t(`leaderRoles.${lr}` as Parameters<typeof t>[0]),
  }));
  const genderOptions = [
    { value: 'MALE', label: tc('male') },
    { value: 'FEMALE', label: tc('female') },
  ];

  const onSubmit = async (values: OrganizerFormValues) => {
    try {
      await mutation.mutateAsync({
        kh_family_name:  values.kh_family_name   ?? '',
        kh_given_name:   values.kh_given_name    ?? '',
        en_family_name:  values.en_family_name   ?? '',
        en_given_name:   values.en_given_name    ?? '',
        gender:          (values.gender ?? 'MALE') as 'MALE' | 'FEMALE',
        date_of_birth:   values.date_of_birth    ?? '',
        phone:           values.phone            ?? undefined,
        address:         values.address          ?? undefined,
        photoUrl:              values.photoUrl             ?? undefined,
        birthCertificateUrl:   values.birthCertificateUrl  ?? undefined,
        nationalIdUrl:         values.nationalIdUrl        ?? undefined,
        passportUrl:           values.passportUrl          ?? undefined,
        leader_role:           (values.leader_role ?? null) as 'coach' | 'manager' | 'delegate' | 'team_lead' | 'coach_trainer' | 'teacher_assistant' | null | undefined,
        role:                  'leader',
        organization_id:       organizationId ?? 0,
        sport_id:              Number(values.sport_id),
        event_id:              values.event_id ?? null,
        id_document_type:      'OTHER',
      });
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Response) {
        const fieldErrors = await parseApiError(err);
        Object.entries(fieldErrors).forEach(([field, msg]) =>
          form.setError(field as keyof OrganizerFormValues, { message: msg })
        );
      } else {
        form.setError('root', { message: tc('somethingWentWrong') });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl" noValidate>
      {form.formState.errors.root && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {form.formState.errors.root.message}
        </div>
      )}

      {!organizationId && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          {t('orgIdMissing')}
        </div>
      )}

      {/* Event & Sport */}
      <section className="space-y-4">
        <SectionHeader title={tr('steps.event')} />
        <SelectField control={form.control as never} name="event_id" labelKey="registration.selectEvent" options={eventOptions} required />
        <SelectField control={form.control as never} name="sport_id" labelKey="registration.selectSport" options={sportOptions} required disabled={!selectedEventId} />
      </section>

      {/* Leader Role */}
      <section className="space-y-4">
        <SectionHeader title={t('leaderRole')} />
        <SelectField control={form.control} name="leader_role" labelKey="participation.leaderRole" options={leaderRoleOptions} required />
      </section>

      {/* Personal Info */}
      <section className="space-y-4">
        <SectionHeader title={tr('steps.personal')} />
        <div className="grid grid-cols-2 gap-4">
          <TextInputField control={form.control} name="kh_family_name" labelKey="registration.fields.familyName" required />
          <TextInputField control={form.control} name="kh_given_name"  labelKey="registration.fields.givenName"  required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextInputField control={form.control} name="en_family_name" labelKey="registration.fields.familyName" required />
          <TextInputField control={form.control} name="en_given_name"  labelKey="registration.fields.givenName"  required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField control={form.control} name="gender" labelKey="registration.fields.gender" options={genderOptions} required />
          <DateField  control={form.control} name="date_of_birth" labelKey="registration.fields.dateOfBirth" required />
        </div>
        <TextInputField control={form.control} name="phone"   labelKey="registration.fields.phone" />
        <TextInputField control={form.control} name="address" labelKey="registration.fields.address" />
      </section>

      {/* Documents — age-gated RED LINE #3 */}
      <section className="space-y-4">
        <SectionHeader title={tr('steps.documents')} />
        {age === null ? (
          <p className="text-sm text-yellow-700">{tr('ageWarning')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {tr('documentRule.ageAtEvent', { age })} — {isMinor ? tr('documentRule.minor') : tr('documentRule.adult')}
          </p>
        )}

        {isMinor !== false && (
          <FileUploadField control={form.control} name="birthCertificateUrl" labelKey="registration.fields.birthCertificate" required={isMinor === true} onUpload={upload} />
        )}
        {isMinor !== true && (
          <>
            <FileUploadField control={form.control} name="photoUrl"      labelKey="registration.fields.profilePhoto" required={isMinor === false} onUpload={upload} />
            <FileUploadField control={form.control} name="nationalIdUrl" labelKey="registration.fields.idDocument"   onUpload={upload} />
            <FileUploadField control={form.control} name="passportUrl"   label={`${tc('optional')} — Passport`}      onUpload={upload} />
          </>
        )}
        {isMinor === null && (
          <FileUploadField control={form.control} name="photoUrl" labelKey="registration.fields.profilePhoto" onUpload={upload} />
        )}
      </section>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={mutation.isPending} loading={mutation.isPending}>
          {t('createTitle')}
        </Button>
      </div>
    </form>
  );
}
