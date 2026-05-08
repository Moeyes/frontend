import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '../services/organizations.service';
import { orgKeys } from '../services/keys';

export function useOrganization(orgId: number) {
  return useQuery({
    queryKey: orgKeys.detail(orgId),
    queryFn:  () => getOrganization(orgId),
    enabled:  !!orgId,
  });
}
