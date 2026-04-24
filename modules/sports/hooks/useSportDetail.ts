import { useQuery } from '@tanstack/react-query';
import { getSportById } from '../services';

export function useSportDetail(sportId: number) {
    return useQuery({
        queryKey: ['sports', sportId],
        queryFn: () => getSportById(sportId),
        enabled: !!sportId,
    });
}
