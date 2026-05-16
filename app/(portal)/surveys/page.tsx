import { ProtectedRoute } from '@/core/auth';
import { SurveyHomePage } from '@/modules/survey';

export default function SurveysRoute() {
  return (
    <ProtectedRoute requiredRoles={['user1', 'user2']}>
      <SurveyHomePage />
    </ProtectedRoute>
  );
}
