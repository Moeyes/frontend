import { useQuery } from '@tanstack/react-query';
import { getUser } from '../services/users.service';
import { userKeys } from '../services/keys';

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn:  () => getUser(userId),
    enabled:  !!userId,
  });
}
