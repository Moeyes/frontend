'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { TextInputField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { parseApiError } from '@/core/api/client';
import { sportCreateSchema, type SportCreateFormValues } from '../services/schema';
import { useCreateSport } from '../hooks/useCreateSport';
import type { SportPublic } from '../services/sports.service';

interface SportFormProps {
  onSuccess: (sport: SportPublic) => void;
}

export function SportForm({ onSuccess }: SportFormProps) {
  const t  = useTranslations('sports');
  const tc = useTranslations('common');

  const form = useForm<SportCreateFormValues>({
    resolver: zodResolver(sportCreateSchema),
    defaultValues: { name_kh: '', sport_type: '' },
  });

  const mutation = useCreateSport();

  const onSubmit = async (values: SportCreateFormValues) => {
    try {
      const result = await mutation.mutateAsync(values);
      onSuccess(result);
    } catch (err: unknown) {
      if (err instanceof Response) {
        const fieldErrors = await parseApiError(err);
        Object.entries(fieldErrors).forEach(([field, msg]) =>
          form.setError(field as keyof SportCreateFormValues, { message: msg })
        );
      } else {
        form.setError('root', { message: tc('somethingWentWrong') });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md" noValidate>
      {form.formState.errors.root && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {form.formState.errors.root.message}
        </div>
      )}
      <TextInputField control={form.control} name="name_kh"    labelKey="sports.sportName" required />
      <TextInputField control={form.control} name="sport_type" labelKey="sports.sportType" required />
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={mutation.isPending} loading={mutation.isPending}>
          {t('createSport')}
        </Button>
      </div>
    </form>
  );
}
