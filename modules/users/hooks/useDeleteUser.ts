import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser } from '../services/users.service';
import { userKeys } from '../services/keys';

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: userKeys.lists() });
      const snapshot = qc.getQueriesData({ queryKey: userKeys.lists() });
      return { snapshot };
    },
    onError: (_err, _userId, context) => {
      context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}
