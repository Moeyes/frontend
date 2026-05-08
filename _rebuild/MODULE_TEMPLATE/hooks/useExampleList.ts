import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/core/auth';
import { listDOMAIN } from '../services/example.service';
import { DOMAIN_keys } from '../services/keys';

interface UseDOMAINListParams {
  skip?: number;
  limit?: number;
  // Add scoping params for non-admin users (Red Line #6):
  // organization_id?: number;
}

export function useDOMAINList(params?: UseDOMAINListParams) {
  // Uncomment and adapt for Federation/Organization users:
  // const { user } = useAuth();
  // const scopedParams = {
  //   ...params,
  //   organization_id: user.role !== 'admin' ? user.organization_id : undefined,
  // };

  return useQuery({
    queryKey: DOMAIN_keys.list(params ?? {}),
    queryFn: () => listDOMAIN(params),
  });
}
