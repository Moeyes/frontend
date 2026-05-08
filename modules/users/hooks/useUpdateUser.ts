import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser, type UserUpdate } from '../services/users.service';
import { userKeys } from '../services/keys';

export function useUpdateUser(userId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (updates: UserUpdate) => updateUser(userId, updates),
    onSuccess:  (updated) => {
      qc.setQueryData(userKeys.detail(userId), updated);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}
