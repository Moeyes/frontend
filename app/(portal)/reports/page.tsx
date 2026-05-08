import { ProtectedRoute } from '@/core/auth';
import { ReportsPage } from '@/modules/reports';

export default function ReportsRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <ReportsPage />
    </ProtectedRoute>
  );
}
