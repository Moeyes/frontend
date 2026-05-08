import { ProtectedRoute } from '@/core/auth';
import { RegistrationStepper } from '@/modules/registration-flow';

export default function RegisterNewRoute() {
  return (
    <ProtectedRoute requiredRoles={['user1']}>
      <RegistrationStepper />
    </ProtectedRoute>
  );
}
