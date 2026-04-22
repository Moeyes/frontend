import { useQuery } from '@tanstack/react-query';
import { fetchAllOrganizations } from '@/features/registration/services/registration-data.service';

export function useAllOrganizations() {
    return useQuery({
        queryKey: ['organizations', 'all'],
        queryFn: fetchAllOrganizations,
    });
}
