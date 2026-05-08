'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { TextInputField, SelectField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { parseApiError } from '@/core/api/client';
import {
  userCreateSchema, userEditSchema,
  type UserCreateFormValues, type UserEditFormValues,
} from '../services/schema';
import type { UserPublic } from '../services/users.service';
import { useCreateUser } from '../hooks/useCreateUser';
import { useUpdateUser } from '../hooks/useUpdateUser';

type Mode = 'create' | 'edit';

interface UserFormProps {
  mode: Mode;
  user?: UserPublic;
  onSuccess: () => void;
}

const ROLE_VALUES = ['admin', 'user1', 'user2', 'guest'] as const;

export function UserForm({ mode, user, onSuccess }: UserFormProps) {
  const t  = useTranslations('users');
  const tc = useTranslations('common');

  const roleOptions = ROLE_VALUES.map((v) => ({
    value: v,
    label: t(`roles.${v}` as Parameters<typeof t>[0]),
  }));

  const schema = mode === 'create' ? userCreateSchema : userEditSchema;

  const form = useForm<UserCreateFormValues | UserEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kh_family_name: user?.kh_family_name ?? '',
      kh_given_name:  user?.kh_given_name  ?? '',
      en_family_name: user?.en_family_name  ?? '',
      en_given_name:  user?.en_given_name   ?? '',
      email:    user?.email    ?? '',
      username: user?.username ?? '',
      password: '',
      role:     (user?.role as UserCreateFormValues['role']) ?? null,
      is_active: user?.is_active ?? true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        kh_family_name: user.kh_family_name,
        kh_given_name:  user.kh_given_name,
        en_family_name: user.en_family_name,
        en_given_name:  user.en_given_name,
        email:    user.email,
        username: user.username,
        password: '',
        role:     user.role as UserCreateFormValues['role'],
        is_active: user.is_active,
      });
    }
  }, [user, form]);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(user?.id ?? '');
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: UserCreateFormValues | UserEditFormValues) => {
    try {
      if (mode === 'create') {
        const v = values as UserCreateFormValues;
        await createMutation.mutateAsync({
          kh_family_name: v.kh_family_name,
          kh_given_name:  v.kh_given_name,
          en_family_name: v.en_family_name,
          en_given_name:  v.en_given_name,
          email:    v.email,
          username: v.username,
          password: v.password,
          role:     v.role ?? undefined,
          is_active: v.is_active ?? true,
          is_superuser: false,
        });
      } else {
        const v = values as UserEditFormValues;
        const updates: Record<string, unknown> = {
          kh_family_name: v.kh_family_name,
          kh_given_name:  v.kh_given_name,
          en_family_name: v.en_family_name,
          en_given_name:  v.en_given_name,
          email:    v.email,
          username: v.username,
          role:     v.role ?? undefined,
          is_active: v.is_active,
        };
        if (v.password) updates.password = v.password;
        await updateMutation.mutateAsync(updates);
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Response) {
        const fieldErrors = await parseApiError(err);
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          form.setError(field as keyof UserCreateFormValues, { message: msg });
        });
      } else {
        form.setError('root', { message: tc('somethingWentWrong') });
      }
    }
  };

  const serverError = form.formState.errors.root?.message;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg" noValidate>
      {serverError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextInputField control={form.control} name="kh_family_name" labelKey="users.khFamilyName" required />
        <TextInputField control={form.control} name="kh_given_name"  labelKey="users.khGivenName"  required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextInputField control={form.control} name="en_family_name" labelKey="users.enFamilyName" required />
        <TextInputField control={form.control} name="en_given_name"  labelKey="users.enGivenName"  required />
      </div>

      <TextInputField control={form.control} name="email"    labelKey="users.email"    type="email"    autoComplete="email" required />
      <TextInputField control={form.control} name="username" labelKey="users.username" autoComplete="username" required />
      <TextInputField
        control={form.control}
        name="password"
        labelKey="users.password"
        type="password"
        autoComplete={mode === 'create' ? 'new-password' : 'off'}
        required={mode === 'create'}
        hint={mode === 'edit' ? t('passwordOptionalHint') : undefined}
      />

      <SelectField
        control={form.control}
        name="role"
        labelKey="users.role"
        options={roleOptions}
        placeholder="—"
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending} loading={isPending}>
          {mode === 'create' ? t('createUser') : tc('save')}
        </Button>
      </div>
    </form>
  );
}
