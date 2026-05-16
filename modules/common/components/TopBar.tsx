'use client';
import { LogOut, User, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/core/auth';
import { LanguageSwitcher } from '@/core/i18n';
import { Button } from '@/shared/ui';
import { ROUTES } from '@/core/config';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTES.login);
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
              <LogOut className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('signOut')}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
