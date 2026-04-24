import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrganization } from '../services';
import { OrganizationUpdateBody } from '../types';

export function useUpdateOrg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orgData: OrganizationUpdateBody) => updateOrganization(orgData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
}
