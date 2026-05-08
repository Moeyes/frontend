import { useQuery } from '@tanstack/react-query';
import { listUsers, type ListUsersParams } from '../services/users.service';
import { userKeys } from '../services/keys';

export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params ?? {}),
    queryFn:  () => listUsers(params),
  });
}
