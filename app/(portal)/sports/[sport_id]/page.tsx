import { ProtectedRoute } from '@/core/auth';
import { SportDetailPage } from '@/modules/sports';

interface Props {
  params: Promise<{ sport_id: string }>;
}

export default async function SportDetailRoute({ params }: Props) {
  const { sport_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <SportDetailPage sportId={Number(sport_id)} />
    </ProtectedRoute>
  );
}
