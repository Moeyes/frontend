import { useQuery } from '@tanstack/react-query';
import { fetchAllOrganizations } from '@/core/lib/reference-data';

export function useAllOrganizations() {
    return useQuery({
        queryKey: ['organizations', 'all'],
        queryFn: fetchAllOrganizations,
    });
}
