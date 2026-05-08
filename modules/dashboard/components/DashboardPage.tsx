'use client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/core/auth';
import { PageHeader } from '@/shared/ui';
import { AdminDashboard } from './AdminDashboard';
import { UserWelcome } from './UserWelcome';

export function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('welcomeBack', {
          name: `${user.kh_family_name} ${user.kh_given_name}`,
        })}
      />

      {user.role === 'admin' && <AdminDashboard />}
      {(user.role === 'user1' || user.role === 'user2' || user.role === 'guest') && (
        <UserWelcome role={user.role} />
      )}
    </div>
  );
}
