import { ProtectedRoute } from '@/core/auth';
import { SportList } from '@/modules/sports';

export default function SportsRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <SportList />
    </ProtectedRoute>
  );
}
