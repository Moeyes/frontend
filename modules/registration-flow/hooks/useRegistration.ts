import { useQuery } from '@tanstack/react-query';
import { getRegistration, type RoleEnum } from '../services/registration.service';
import { regKeys } from '../services/keys';

export function useRegistration(enrollId: number, role: RoleEnum) {
  return useQuery({
    queryKey: regKeys.detail(enrollId),
    queryFn:  () => getRegistration(enrollId, role),
    enabled:  !!enrollId,
  });
}
