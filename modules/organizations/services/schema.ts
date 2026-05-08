import { z } from 'zod';
import { INSTITUTE_TYPES } from './organizations.service';

export const organizationSchema = z.object({
  name_kh: z.string().min(1, { message: 'organizations.validation.nameRequired' }),
  type: z.enum(INSTITUTE_TYPES as [string, ...string[]], {
    message: 'organizations.validation.typeRequired',
  }),
  code: z.string().optional().nullable(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
