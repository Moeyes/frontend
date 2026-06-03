import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { fetchAllSports } from '@/core/lib/reference-data';

export function useAllSports() {
    return useQuery({
        queryKey: queryKeys.sports.allList,
        queryFn: fetchAllSports,
    });
}
