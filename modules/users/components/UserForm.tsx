'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { User } from '@/core/auth';
import { UserRole } from '@/core/auth';
import { UserCreate } from '../types';
import { useCreateUser, useUpdateUser } from '../hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField, SelectField } from '@/shared/form';
import { useTranslations } from 'next-intl';

const userSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().optional().or(z.literal('')),
    khmer_name: z.string().min(2),
    english_name: z.string().min(2),
    role: z.nativeEnum(UserRole),
    org_id: z.any().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;
interface UserFormProps { user?: User; onSuccess: () => void; onCancel: () => void; }

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
    const isEditing = !!user;
    const { mutate: create, isPending: isCreating } = useCreateUser();
    const { mutate: update, isPending: isUpdating } = useUpdateUser();
    const t = useTranslations('users');
    const tCommon = useTranslations('common');

    const { control, handleSubmit, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: user ? { username: user.username, email: user.email, khmer_name: user.khmer_name, english_name: user.english_name, role: user.role, org_id: user.org_id?.toString() || '' }
            : { role: UserRole.GUEST, username: '', email: '', khmer_name: '', english_name: '', password: '', org_id: '' }
    });

    const onSubmit = (data: UserFormValues) => {
        const payload = { ...data, org_id: data.org_id ? Number(data.org_id) : null };
        if (isEditing) update({ id: user.id, ...payload }, { onSuccess });
        else create({ ...payload, username: data.username, email: data.email, khmer_name: data.khmer_name, english_name: data.english_name, role: data.role, password: data.password || 'password123' } as UserCreate, { onSuccess });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField control={control} name="username" label={t('username')} required error={errors.username?.message} />
            <TextInputField control={control} name="email" label={t('email')} type="email" required error={errors.email?.message} />
            {!isEditing && <TextInputField control={control} name="password" label={t('password')} type="password" required error={errors.password?.message} />}
            <div className="grid grid-cols-2 gap-4">
                <TextInputField control={control} name="khmer_name" label={t('khmerName')} required error={errors.khmer_name?.message} />
                <TextInputField control={control} name="english_name" label={t('englishName')} required error={errors.english_name?.message} />
            </div>
            <SelectField control={control} name="role" label={t('role')} required options={[
                { value: UserRole.ADMIN, label: t('roles.admin') },
                { value: UserRole.ORGANIZATION, label: t('roles.organization') },
                { value: UserRole.FEDERATION, label: t('roles.federation') },
                { value: UserRole.GUEST, label: t('roles.guest') },
            ]} error={errors.role?.message} />
            <TextInputField control={control} name="org_id" label={t('orgIdOptional')} type="number" error={errors.org_id?.message as string} />
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? tCommon('saving') : isEditing ? t('editUser') : t('createUser')}
                </Button>
            </div>
        </form>
    );
}
