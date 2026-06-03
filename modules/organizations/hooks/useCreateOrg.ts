import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { createOrganization } from '../services';
import { OrganizationCreate } from '../types';

export function useCreateOrg() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('created') },
        mutationFn: (orgData: OrganizationCreate) => createOrganization(orgData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
        },
    });
}
