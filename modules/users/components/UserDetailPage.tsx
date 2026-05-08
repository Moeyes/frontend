'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { QueryBoundary, PageHeader, BackLink } from '@/shared/ui';
import { ROUTES } from '@/core/config';
import { useUser } from '../hooks/useUser';
import { UserForm } from './UserForm';

interface UserDetailPageProps {
  userId: string;
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const t = useTranslations('users');
  const router = useRouter();
  const query = useUser(userId);

  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.users.list} label={t('backToList')} />
      <PageHeader title={t('editUser')} />

      <QueryBoundary query={query}>
        {(user) => (
          <UserForm
            mode="edit"
            user={user}
            onSuccess={() => router.push(ROUTES.users.list)}
          />
        )}
      </QueryBoundary>
    </div>
  );
}
