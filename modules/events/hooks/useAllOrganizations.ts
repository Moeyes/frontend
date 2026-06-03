import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { fetchAllOrganizations } from '@/core/lib/reference-data';

export function useAllOrganizations() {
    return useQuery({
        queryKey: queryKeys.organizations.allList,
        queryFn: fetchAllOrganizations,
    });
}
