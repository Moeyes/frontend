'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui/Button'
import { TextInputField } from '@/shared/form/TextInputField'
import { useExampleCreate } from '../hooks'
import { exampleCreateSchema, type ExampleCreateForm } from '../services/schema'

export function ExampleCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useTranslations('MODULE_NAME')
  const { mutate, isPending } = useExampleCreate()

  const form = useForm<ExampleCreateForm>({
    resolver: zodResolver(exampleCreateSchema),
    defaultValues: {
      // fill defaults
    },
  })

  function onSubmit(values: ExampleCreateForm) {
    mutate(values, { onSuccess })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <TextInputField
        control={form.control}
        name="fieldName"
        label={t('form.field_name')}
      />
      {/* add more fields */}
      <Button type="submit" disabled={isPending} loading={isPending}>
        {t('form.submit')}
      </Button>
    </form>
  )
}
