import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrganization, type OrganizationUpdate } from '../services/organizations.service';
import { orgKeys } from '../services/keys';

export function useUpdateOrganization(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: OrganizationUpdate) => updateOrganization(orgId, updates),
    onSuccess:  (updated) => qc.setQueryData(orgKeys.detail(orgId), updated),
    onSettled:  () => qc.invalidateQueries({ queryKey: orgKeys.lists() }),
  });
}
