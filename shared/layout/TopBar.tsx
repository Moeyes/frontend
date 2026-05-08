'use client';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/core/auth';
import { LanguageSwitcher } from '@/core/i18n';
import { Button } from '@/shared/ui/Button';

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {user.kh_family_name} {user.kh_given_name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {t('signOut')}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
