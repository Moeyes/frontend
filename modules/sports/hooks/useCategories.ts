import { useQuery } from '@tanstack/react-query';
import { listCategories } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useCategories(eventId: number, sportId: number) {
  return useQuery({
    queryKey: sportKeys.categories(eventId, sportId),
    queryFn:  () => listCategories(eventId, sportId),
    enabled:  !!eventId && !!sportId,
  });
}
