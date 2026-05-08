import { ProtectedRoute } from '@/core/auth';
import { SurveyAdminTab } from '@/modules/survey';

interface Props { params: Promise<{ event_id: string }>; }

export default async function EventSurveysRoute({ params }: Props) {
  const { event_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <SurveyAdminTab eventId={Number(event_id)} />
    </ProtectedRoute>
  );
}
