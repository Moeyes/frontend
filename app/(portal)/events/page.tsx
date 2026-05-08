import { ProtectedRoute } from '@/core/auth';
import { EventList } from '@/modules/events';

export default function EventsRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <EventList />
    </ProtectedRoute>
  );
}
