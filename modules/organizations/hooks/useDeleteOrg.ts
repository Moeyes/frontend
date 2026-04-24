import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOrganization } from '../services';
import { OrganizationDeleteBody } from '../types';

export function useDeleteOrg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: OrganizationDeleteBody) => deleteOrganization(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
}
