import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSport } from '../services';
import { SportCreate } from '../types';

export function useCreateSport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sportData: SportCreate) => createSport(sportData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sports'] });
        },
    });
}
