import { ProtectedRoute } from '@/core/auth';
import { OrganizerList } from '@/modules/participation';

export default function ParticipationRoute() {
  return (
    <ProtectedRoute requiredRoles={['user1', 'user2']}>
      <OrganizerList />
    </ProtectedRoute>
  );
}
