import { ProtectedRoute } from '@/core/auth';
import { CardsPage } from '@/modules/cards';

export default function CardsRoute() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'user1']}>
      <CardsPage />
    </ProtectedRoute>
  );
}
