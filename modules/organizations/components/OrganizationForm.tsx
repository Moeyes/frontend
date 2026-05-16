'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { TextInputField, SelectField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { parseApiError } from '@/core/api/client';
import { organizationSchema, type OrganizationFormValues } from '../services/schema';
import { INSTITUTE_TYPES, type OrganizationPublic, type OrganizationCreate, type OrganizationUpdate } from '../services/organizations.service';
import { useCreateOrganization } from '../hooks/useCreateOrganization';
import { useUpdateOrganization } from '../hooks/useUpdateOrganization';

interface OrganizationFormProps {
  mode: 'create' | 'edit';
  org?: OrganizationPublic;
  onSuccess: (org: OrganizationPublic) => void;
}

export function OrganizationForm({ mode, org, onSuccess }: OrganizationFormProps) {
  const t  = useTranslations('organizations');
  const tc = useTranslations('common');

  const typeOptions = INSTITUTE_TYPES.map((v) => ({
    value: v,
    label: t(`types.${v}` as Parameters<typeof t>[0]),
  }));

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name_kh: org?.name_kh ?? '',
      type:    org?.type    ?? ('' as OrganizationFormValues['type']),
      code:    org?.code    ?? '',
    },
  });

  useEffect(() => {
    if (org) form.reset({ name_kh: org.name_kh, type: org.type, code: org.code ?? '' });
  }, [org, form]);

  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization(org?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: OrganizationFormValues) => {
    const payload = { ...values, code: values.code || null };
    try {
      const result = mode === 'create'
        ? await createMutation.mutateAsync(payload as OrganizationCreate)
        : await updateMutation.mutateAsync(payload as OrganizationUpdate);
      toast.success(mode === 'create' ? t('createOrganization') : tc('save'));
      onSuccess(result);
    } catch (err: unknown) {
      if (err instanceof Response) {
        const fieldErrors = await parseApiError(err);
        Object.entries(fieldErrors).forEach(([field, msg]) =>
          form.setError(field as keyof OrganizationFormValues, { message: msg })
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

      <TextInputField control={form.control} name="name_kh" labelKey="organizations.nameKh" required />
      <SelectField
        control={form.control}
        name="type"
        labelKey="organizations.instituteType"
        options={typeOptions}
        required
      />
      <TextInputField control={form.control} name="code" labelKey="organizations.codeOptional" />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} loading={isPending}>
          {mode === 'create' ? t('createOrganization') : tc('save')}
        </Button>
      </div>
    </form>
  );
}
