'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { FileUploadField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { computeAgeAtEvent } from '@/core/lib';
import { MINOR_AGE_THRESHOLD } from '@/core/config';
import { useEvent } from '@/modules/events';
import { documentStepSchema, type DocumentStepValues } from '../services/schema';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';

interface DocumentStepProps {
  defaultValues?: Partial<DocumentStepValues>;
  eventId:        number;
  dateOfBirth:    string;
  onNext: (values: DocumentStepValues) => void;
  onBack: () => void;
}

export function DocumentStep({
  defaultValues, eventId, dateOfBirth, onNext, onBack,
}: DocumentStepProps) {
  const t  = useTranslations('registration');
  const tc = useTranslations('common');

  const eventQuery = useEvent(eventId);
  const upload     = useCloudinaryUpload();

  // RED LINE #3 — ALWAYS compute age from event start date, NEVER from new Date()
  const eventStartDate = eventQuery.data?.start_date ?? null;
  const age = eventStartDate
    ? computeAgeAtEvent(dateOfBirth, eventStartDate)
    : null;
  const isMinor = age !== null ? age < MINOR_AGE_THRESHOLD : null;

  const schema = documentStepSchema.superRefine((vals, ctx) => {
    if (isMinor === true && !vals.birthCertificateUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['birthCertificateUrl'],
        message: 'registration.validation.birthCertRequired',
      });
    }
    if (isMinor === false && !vals.nationalIdUrl && !vals.passportUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['nationalIdUrl'],
        message: 'registration.validation.idOrPassportRequired',
      });
    }
  });

  const form = useForm<DocumentStepValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      {/* Age info banner */}
      {age === null ? (
        <div className="flex items-center gap-2 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {t('ageWarning')}
        </div>
      ) : (
        <div className="rounded-md bg-muted px-4 py-3 text-sm">
          <p>{t('documentRule.ageAtEvent', { age })}</p>
          <p className="font-medium mt-0.5">
            {isMinor ? t('documentRule.minor') : t('documentRule.adult')}
          </p>
        </div>
      )}

      {/* Document fields — conditional on age */}
      {isMinor !== false && (
        <FileUploadField
          control={form.control}
          name="birthCertificateUrl"
          labelKey="registration.fields.birthCertificate"
          required={isMinor === true}
          onUpload={upload}
        />
      )}

      {isMinor !== true && (
        <>
          <FileUploadField
            control={form.control}
            name="photoUrl"
            labelKey="registration.fields.profilePhoto"
            required={isMinor === false}
            onUpload={upload}
          />
          <FileUploadField
            control={form.control}
            name="nationalIdUrl"
            labelKey="registration.fields.idDocument"
            onUpload={upload}
          />
          <FileUploadField
            control={form.control}
            name="passportUrl"
            label={tc('optional') + ' — Passport'}
            onUpload={upload}
          />
        </>
      )}

      {isMinor === null && (
        <FileUploadField
          control={form.control}
          name="photoUrl"
          labelKey="registration.fields.profilePhoto"
          onUpload={upload}
        />
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← {tc('back')}</Button>
        <Button type="submit">{tc('next')} →</Button>
      </div>
    </form>
  );
}
