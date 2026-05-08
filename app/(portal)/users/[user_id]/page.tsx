import { ProtectedRoute } from '@/core/auth';
import { UserDetailPage } from '@/modules/users';

interface Props {
  params: Promise<{ user_id: string }>;
}

export default async function UserDetailRoute({ params }: Props) {
  const { user_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <UserDetailPage userId={user_id} />
    </ProtectedRoute>
  );
}
