'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useAuth } from '@/core/auth';
import { ROUTES } from '@/core/config';

export function UnauthorizedPage() {
  const t = useTranslations('unauthorized');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTES.login);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <ShieldX className="h-12 w-12 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground max-w-xs">{t('noPermission')}</p>
        {user && (
          <p className="text-xs text-muted-foreground">
            {t('signedInAs')}{' '}
            <span className="font-medium">
              {user.kh_family_name} {user.kh_given_name}
            </span>
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.replace(ROUTES.dashboard)}>
          {t('goToDashboard')}
        </Button>
        <Button variant="ghost" onClick={handleLogout}>
          {t('signOut')}
        </Button>
      </div>
    </div>
  );
}
