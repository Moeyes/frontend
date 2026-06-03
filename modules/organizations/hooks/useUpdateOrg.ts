import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { updateOrganization } from '../services';
import { OrganizationUpdateBody } from '../types';

export function useUpdateOrg() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('updated') },
        mutationFn: (orgData: OrganizationUpdateBody) => updateOrganization(orgData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
        },
    });
}
