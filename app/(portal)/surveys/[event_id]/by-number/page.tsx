import { ProtectedRoute } from '@/core/auth';
import { ByNumberSurveyForm } from '@/modules/survey';

interface Props { params: Promise<{ event_id: string }>; }

export default async function ByNumberRoute({ params }: Props) {
  const { event_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['user2']}>
      <ByNumberSurveyForm eventId={Number(event_id)} />
    </ProtectedRoute>
  );
}
