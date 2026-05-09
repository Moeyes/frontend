import { ProtectedRoute } from '@/core/auth';
import { TeamRegistrationPage } from '@/modules/registration-flow';

export default function RegisterTeamRoute() {
  return (
    <ProtectedRoute requiredRoles={['user1']}>
      <TeamRegistrationPage />
    </ProtectedRoute>
  );
}
