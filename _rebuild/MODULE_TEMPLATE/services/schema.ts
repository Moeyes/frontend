import { z } from 'zod';

// Replace with actual fields from _contract/api.types.ts components['schemas']['<Entity>Create']
// Error message values must be i18n keys — they are resolved via t() in shared/form/FormField
export const DOMAIN_createSchema = z.object({
  // example: name_kh: z.string().min(1, { message: 'DOMAIN.form.nameRequired' }),
});

export const DOMAIN_updateSchema = DOMAIN_createSchema.partial();

export type DOMAIN_CreateFormValues = z.infer<typeof DOMAIN_createSchema>;
export type DOMAIN_UpdateFormValues = z.infer<typeof DOMAIN_updateSchema>;
