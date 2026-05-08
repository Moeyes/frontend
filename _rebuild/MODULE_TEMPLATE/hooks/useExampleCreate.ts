import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { createDOMAIN, type DOMAINCreate } from '../services/example.service';
import { DOMAIN_keys } from '../services/keys';

export function useCreateDOMAIN() {
  const qc = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (body: DOMAINCreate) => createDOMAIN(body),

    onMutate: async (_newItem) => {
      await qc.cancelQueries({ queryKey: DOMAIN_keys.lists() });
      const previous = qc.getQueryData(DOMAIN_keys.list({}));
      // Optionally insert optimistic row here
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(DOMAIN_keys.list({}), context.previous);
      }
      toast.error(t('common.error.createFailed'));
    },

    onSuccess: () => {
      toast.success(t('common.success.created'));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: DOMAIN_keys.lists() });
    },
  });
}
