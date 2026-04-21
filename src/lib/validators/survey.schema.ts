import { z } from 'zod';

export const surveySchema = z.object({
    eventId: z.coerce.number().int().positive('Event is required').nullable(),
    organizationId: z.coerce.number().int().positive('Organization is required').nullable(),
    sportIds: z.array(z.number().int().positive()).min(1, 'Select at least one sport'),
});

export type SurveyFormData = z.infer<typeof surveySchema>;
