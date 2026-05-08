import { useQuery } from '@tanstack/react-query';
import { listRegistrations, type ListRegistrationsParams } from '../services/registration.service';
import { regKeys } from '../services/keys';

export function useRegistrations(params: ListRegistrationsParams) {
  return useQuery({
    queryKey: regKeys.list(params),
    queryFn:  () => listRegistrations(params),
    enabled:  !!params.role,
  });
}
