import { ProtectedRoute } from '@/core/auth';
import { OrganizerDetailPage } from '@/modules/participation';

interface Props { params: Promise<{ enroll_id: string }>; }

export default async function OrganizerDetailRoute({ params }: Props) {
  const { enroll_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['user1', 'user2']}>
      <OrganizerDetailPage enrollId={Number(enroll_id)} />
    </ProtectedRoute>
  );
}
