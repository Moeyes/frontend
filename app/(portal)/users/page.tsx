import { ProtectedRoute } from '@/core/auth';
import { UserList } from '@/modules/users';

export default function UsersRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <UserList />
    </ProtectedRoute>
  );
}
