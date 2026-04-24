import { useQuery } from '@tanstack/react-query';
import { getSports } from '../services';

export function useSports() {
    return useQuery({
        queryKey: ['sports'],
        queryFn: getSports,
    });
}
