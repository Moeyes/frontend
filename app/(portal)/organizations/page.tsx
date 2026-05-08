import { ProtectedRoute } from '@/core/auth';
import { OrganizationList } from '@/modules/organizations';

export default function OrganizationsRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <OrganizationList />
    </ProtectedRoute>
  );
}
