import { ProtectedRoute } from '@/core/auth';
import { ByCategorySurveyForm } from '@/modules/survey';

interface Props { params: Promise<{ event_id: string }>; }

export default async function ByCategoryRoute({ params }: Props) {
  const { event_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['user1']}>
      <ByCategorySurveyForm eventId={Number(event_id)} />
    </ProtectedRoute>
  );
}
