import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getOrganizations } from '../services';

export function useOrganizations() {
    return useQuery({
        queryKey: queryKeys.organizations.all,
        queryFn: getOrganizations,
    });
}
