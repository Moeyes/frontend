import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { getCategoriesBySportId } from '../services';

export function useCategories(sportId: number) {
    return useQuery({
        queryKey: queryKeys.categories.bySport(sportId),
        queryFn: () => getCategoriesBySportId(sportId),
        enabled: !!sportId,
    });
}
