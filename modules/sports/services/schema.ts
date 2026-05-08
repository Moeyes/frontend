import { z } from 'zod';

export const sportCreateSchema = z.object({
  name_kh:    z.string().min(1, { message: 'sports.validation.nameRequired' }),
  sport_type: z.string().min(1, { message: 'sports.validation.typeRequired' }),
});

export const categoryCreateSchema = z.object({
  category_name: z.string().min(1, { message: 'sports.validation.categoryNameRequired' }),
  gender: z.enum(['MALE', 'FEMALE'], { message: 'sports.validation.genderRequired' }),
});

export const categoryEditSchema = z.object({
  category_name: z.string().min(1, { message: 'sports.validation.categoryNameRequired' }),
});

export type SportCreateFormValues    = z.infer<typeof sportCreateSchema>;
export type CategoryCreateFormValues = z.infer<typeof categoryCreateSchema>;
export type CategoryEditFormValues   = z.infer<typeof categoryEditSchema>;
