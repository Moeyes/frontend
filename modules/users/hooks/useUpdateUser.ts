import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../services';
import { UserUpdate } from '../types';

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: UserUpdate) => updateUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}
