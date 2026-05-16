import { ProtectedRoute } from '@/core/auth';
import { ParticipantDetailPage } from '@/modules/registration-flow';

interface Props { params: Promise<{ enroll_id: string }>; }

export default async function ParticipantDetailRoute({ params }: Props) {
  const { enroll_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['user2']}>
      <ParticipantDetailPage enrollId={Number(enroll_id)} />
    </ProtectedRoute>
  );
}
