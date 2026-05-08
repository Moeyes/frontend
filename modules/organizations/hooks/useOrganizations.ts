import { useQuery } from '@tanstack/react-query';
import { listOrganizations, type ListOrgsParams } from '../services/organizations.service';
import { orgKeys } from '../services/keys';

export function useOrganizations(params?: ListOrgsParams) {
  return useQuery({
    queryKey: orgKeys.list(params ?? {}),
    queryFn:  () => listOrganizations(params),
  });
}
