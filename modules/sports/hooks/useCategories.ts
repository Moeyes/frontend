import { useQuery } from '@tanstack/react-query';
import { getCategoriesBySportId } from '../services';

export function useCategories(sportId: number) {
    return useQuery({
        queryKey: ['categories', sportId],
        queryFn: () => getCategoriesBySportId(sportId),
        enabled: !!sportId,
    });
}
