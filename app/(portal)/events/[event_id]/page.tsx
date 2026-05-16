import { ProtectedRoute } from '@/core/auth';
import { EventDetailPage } from '@/modules/events';

interface Props {
  params: Promise<{ event_id: string }>;
}

export default async function EventDetailRoute({ params }: Props) {
  const { event_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['admin', 'user1', 'user2']}>
      <EventDetailPage eventId={Number(event_id)} />
    </ProtectedRoute>
  );
}
