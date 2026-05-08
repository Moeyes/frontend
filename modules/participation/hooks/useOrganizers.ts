import { useRegistrations } from '@/modules/registration-flow';

interface UseOrganizersParams {
  organization_id?: number | null;
  search?:          string | null;
}

export function useOrganizers(params?: UseOrganizersParams) {
  return useRegistrations({
    role:            'leader',
    organization_id: params?.organization_id,
    search:          params?.search,
    limit:           100,
  });
}
