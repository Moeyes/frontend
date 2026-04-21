import { z } from 'zod';

export const surveySchema = z.object({
    eventId: z.number({ required_error: 'Event is required' }).int().positive().nullable().refine(val => val !== null, 'Event is required'),
    organizationId: z.number({ required_error: 'Organization is required' }).int().positive().nullable().refine(val => val !== null, 'Organization is required'),
    sportIds: z.array(z.number().int().positive()).min(1, 'Select at least one sport'),
});

export type SurveyFormData = z.infer<typeof surveySchema>;
