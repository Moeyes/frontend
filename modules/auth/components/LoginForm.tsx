'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { TextInputField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { ROUTES } from '@/core/config';
import { loginSchema, type LoginFormValues } from '../services/schema';
import { useLogin } from '../hooks';

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const serverError = form.formState.errors.root?.message;

  const onSubmit = (values: LoginFormValues) => {
    mutate(values, {
      onSuccess: () => {
        router.replace(ROUTES.dashboard);
      },
      onError: (err: unknown) => {
        const msg =
          typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : t('auth.invalidCredentials');
        form.setError('root', { message: msg });
      },
    });
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="text-muted-foreground hover:text-foreground"
      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
      tabIndex={-1}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <TextInputField
        control={form.control}
        name="username"
        labelKey="auth.username"
        placeholder={t('auth.usernamePlaceholder')}
        autoComplete="username"
        autoFocus
      />

      <TextInputField
        control={form.control}
        name="password"
        labelKey="auth.password"
        placeholder={t('auth.passwordPlaceholder')}
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        rightElement={passwordToggle}
      />

      <Button type="submit" className="w-full" disabled={isPending} loading={isPending}>
        {isPending ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </form>
  );
}
