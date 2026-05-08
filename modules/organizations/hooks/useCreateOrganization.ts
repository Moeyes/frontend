import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrganization, type OrganizationCreate } from '../services/organizations.service';
import { orgKeys } from '../services/keys';

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OrganizationCreate) => createOrganization(body),
    onSettled:  () => qc.invalidateQueries({ queryKey: orgKeys.lists() }),
  });
}
