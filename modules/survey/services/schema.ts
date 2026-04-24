import { z } from 'zod';

export const surveySchema = z.object({
    eventId: z.number().int().positive().nullable().refine(val => val !== null, { message: 'Event is required' }),
    organizationId: z.number().int().positive().nullable().refine(val => val !== null, { message: 'Organization is required' }),
    sportIds: z.array(z.number().int().positive()).min(1, 'Select at least one sport'),
});

export type SurveyFormData = z.infer<typeof surveySchema>;
