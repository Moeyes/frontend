import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrganization } from '../services';
import { OrganizationCreate } from '../types';

export function useCreateOrg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orgData: OrganizationCreate) => createOrganization(orgData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
}
