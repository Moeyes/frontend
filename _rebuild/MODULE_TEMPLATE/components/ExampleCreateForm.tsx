'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { TextInputField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { DOMAIN_createSchema, type DOMAIN_CreateFormValues } from '../services/schema';
import { useCreateDOMAIN } from '../hooks';

export function DOMAINCreateForm() {
  const t = useTranslations();
  const router = useRouter();
  const { mutate, isPending } = useCreateDOMAIN();

  const form = useForm<DOMAIN_CreateFormValues>({
    resolver: zodResolver(DOMAIN_createSchema),
    defaultValues: {},
  });

  function onSubmit(values: DOMAIN_CreateFormValues) {
    mutate(values, {
      onSuccess: () => {
        router.push('/REPLACE_WITH_LIST_ROUTE');
      },
      onError: (err: any) => {
        // Map RFC7807 validation errors back to form fields
        if (err?.detail && Array.isArray(err.detail)) {
          err.detail.forEach(({ loc, msg }: { loc: string[]; msg: string }) => {
            const field = loc[loc.length - 1] as keyof DOMAIN_CreateFormValues;
            form.setError(field, { message: msg });
          });
        }
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Replace with actual fields */}
      <TextInputField
        control={form.control}
        name="REPLACE_ME"
        labelKey="DOMAIN.form.REPLACE_ME"
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} loading={isPending}>
          {t('common.save')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
