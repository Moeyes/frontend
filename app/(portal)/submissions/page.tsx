import { ProtectedRoute } from '@/core/auth';
import { SubmissionList } from '@/modules/submissions';

export default function SubmissionsRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <SubmissionList />
    </ProtectedRoute>
  );
}
