import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getSports } from '../services';

export function useSports() {
    return useQuery({
        queryKey: queryKeys.sports.all,
        queryFn: getSports,
    });
}
