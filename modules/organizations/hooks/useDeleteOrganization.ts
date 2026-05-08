import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOrganization } from '../services/organizations.service';
import { orgKeys } from '../services/keys';

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orgId: number) => deleteOrganization(orgId),
    onMutate: async (orgId) => {
      await qc.cancelQueries({ queryKey: orgKeys.lists() });
      const snapshot = qc.getQueriesData({ queryKey: orgKeys.lists() });
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: orgKeys.lists() }),
  });
}
