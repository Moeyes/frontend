import { z } from 'zod'

export const exampleCreateSchema = z.object({
  // Replace with real fields from _contract/api.types.ts
  // name_kh: z.string().min(1, { message: 'MODULE_NAME.validation.name_required' }),
})

export type ExampleCreateForm = z.infer<typeof exampleCreateSchema>

export const exampleUpdateSchema = exampleCreateSchema.partial()
export type ExampleUpdateForm = z.infer<typeof exampleUpdateSchema>
