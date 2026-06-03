import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getSportById } from '../services';

export function useSportDetail(sportId: number) {
    return useQuery({
        queryKey: queryKeys.sports.detail(sportId),
        queryFn: () => getSportById(sportId),
        enabled: !!sportId,
    });
}
