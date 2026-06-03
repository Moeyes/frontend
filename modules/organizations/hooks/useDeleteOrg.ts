import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { useTranslations } from 'next-intl';
import { deleteOrganization } from '../services';
import { OrganizationDeleteBody } from '../types';

export function useDeleteOrg() {
    const queryClient = useQueryClient();
    const t = useTranslations('common.toast');

    return useMutation({
        meta: { successMessage: t('deleted') },
        mutationFn: (payload: OrganizationDeleteBody) => deleteOrganization(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
        },
    });
}
