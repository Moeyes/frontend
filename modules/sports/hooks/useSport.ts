import { useQuery } from '@tanstack/react-query';
import { getSport } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useSport(sportId: number) {
  return useQuery({
    queryKey: sportKeys.detail(sportId),
    queryFn:  () => getSport(sportId),
    enabled:  !!sportId,
  });
}
