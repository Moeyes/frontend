import { ProtectedRoute } from '@/core/auth';
import { BySportSurveyForm } from '@/modules/survey';

interface Props { params: Promise<{ event_id: string }>; }

export default async function BySportRoute({ params }: Props) {
  const { event_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['user2']}>
      <BySportSurveyForm eventId={Number(event_id)} />
    </ProtectedRoute>
  );
}
