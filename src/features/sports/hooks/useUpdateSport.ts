import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSport } from '../services';
import { SportUpdate } from '../types';

export function useUpdateSport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sportData: SportUpdate) => updateSport(sportData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sports'] });
        },
    });
}
