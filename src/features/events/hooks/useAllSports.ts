import { useQuery } from '@tanstack/react-query';
import { fetchAllSports } from '@/features/registration/services/registration-data.service';

export function useAllSports() {
    return useQuery({
        queryKey: ['sports', 'all'],
        queryFn: fetchAllSports,
    });
}
