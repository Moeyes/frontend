import { useQuery } from '@tanstack/react-query';
import { fetchAllSports } from '@/core/lib/reference-data';

export function useAllSports() {
    return useQuery({
        queryKey: ['sports', 'all'],
        queryFn: fetchAllSports,
    });
}
