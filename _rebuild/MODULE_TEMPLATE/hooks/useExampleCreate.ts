import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { createExample } from '../services/example.service'
import { exampleKeys } from '../services/keys'
import type { ExampleCreateForm } from '../services/schema'

export function useExampleCreate() {
  const queryClient = useQueryClient()
  const t = useTranslations('MODULE_NAME')

  return useMutation({
    mutationFn: (data: ExampleCreateForm) => createExample(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: exampleKeys.lists() })
      const previous = queryClient.getQueryData(exampleKeys.lists())
      // optimistic insert
      queryClient.setQueryData(exampleKeys.lists(), (old: any) =>
        old ? { ...old, data: [{ ...newData, id: -1 }, ...old.data] } : old
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(exampleKeys.lists(), ctx?.previous)
      toast.error(t('error.create_failed'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: exampleKeys.lists() })
    },
    onSuccess: () => {
      toast.success(t('success.created'))
    },
  })
}
