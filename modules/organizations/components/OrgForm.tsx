'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Organization, InstituteType, OrganizationCreate } from '../types';
import { useCreateOrg, useUpdateOrg } from '../hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField, SelectField } from '@/shared/form';
import { useTranslations } from 'next-intl';

const orgSchema = z.object({
    name_kh: z.string().min(2),
    name_en: z.string().optional().or(z.literal('')),
    type: z.nativeEnum(InstituteType),
    code: z.string().optional().or(z.literal('')),
    province: z.string().optional().or(z.literal('')),
});

type OrgFormValues = z.infer<typeof orgSchema>;
interface OrgFormProps { org?: Organization; onSuccess: () => void; onCancel: () => void; }

export function OrgForm({ org, onSuccess, onCancel }: OrgFormProps) {
    const isEditing = !!org;
    const { mutate: create, isPending: isCreating } = useCreateOrg();
    const { mutate: update, isPending: isUpdating } = useUpdateOrg();
    const t = useTranslations('organizations');
    const tCommon = useTranslations('common');

    const { control, handleSubmit, formState: { errors } } = useForm<OrgFormValues>({
        resolver: zodResolver(orgSchema),
        defaultValues: org ? { name_kh: org.name_kh, name_en: org.name_en || '', type: org.type, code: org.code || '', province: org.province || '' }
            : { name_kh: '', name_en: '', type: InstituteType.PROVINCE, code: '', province: '' }
    });

    const onSubmit = (data: OrgFormValues) => {
        if (isEditing) update({ id: org.id, ...data }, { onSuccess });
        else create(data as OrganizationCreate, { onSuccess });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField control={control} name="name_kh" label={t('nameKhmer')} required error={errors.name_kh?.message} />
            <TextInputField control={control} name="name_en" label={t('nameEnglish')} error={errors.name_en?.message} />
            <SelectField control={control} name="type" label={t('instituteType')} required options={[
                { value: InstituteType.PROVINCE, label: t('types.PROVINCE') },
                { value: InstituteType.MINISTRY, label: t('types.MINISTRY') },
            ]} error={errors.type?.message} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInputField control={control} name="code" label={t('codeOptional')} error={errors.code?.message} />
                <TextInputField control={control} name="province" label={t('provinceOptional')} error={errors.province?.message} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? tCommon('saving') : isEditing ? t('editOrganization') : t('createOrganization')}
                </Button>
            </div>
        </form>
    );
}
