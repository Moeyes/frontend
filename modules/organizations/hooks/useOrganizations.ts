import { useQuery } from '@tanstack/react-query';
import { getOrganizations } from '../services';

export function useOrganizations() {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: getOrganizations,
    });
}
