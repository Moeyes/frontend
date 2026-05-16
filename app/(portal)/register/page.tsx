import { ProtectedRoute } from '@/core/auth';
import { RegistrationHomePage } from '@/modules/registration-flow';

export default function RegisterRoute() {
  return (
    <ProtectedRoute requiredRoles={['user2']}>
      <RegistrationHomePage />
    </ProtectedRoute>
  );
}
