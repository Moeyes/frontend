import { z } from 'zod';

export const countRowSchema = z.object({
  athlete_male_count:   z.number().int().min(0, { message: 'survey.validation.nonNegative' }),
  athlete_female_count: z.number().int().min(0, { message: 'survey.validation.nonNegative' }),
  leader_male_count:    z.number().int().min(0, { message: 'survey.validation.nonNegative' }),
  leader_female_count:  z.number().int().min(0, { message: 'survey.validation.nonNegative' }),
});

export const byNumberSchema = countRowSchema;

export type CountRowValues  = z.infer<typeof countRowSchema>;
export type ByNumberValues  = z.infer<typeof byNumberSchema>;
