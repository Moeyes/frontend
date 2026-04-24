import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '../services';
import { UserCreate } from '../types';

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: UserCreate) => createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}
