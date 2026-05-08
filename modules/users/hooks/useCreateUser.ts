import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, type UserCreate } from '../services/users.service';
import { userKeys } from '../services/keys';

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: UserCreate) => createUser(body),
    onSettled:  () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}
