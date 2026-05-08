import { useQuery } from '@tanstack/react-query';
import { listSports, type ListSportsParams } from '../services/sports.service';
import { sportKeys } from '../services/keys';

export function useSports(params?: ListSportsParams) {
  return useQuery({
    queryKey: sportKeys.list(params ?? {}),
    queryFn:  () => listSports(params),
  });
}
