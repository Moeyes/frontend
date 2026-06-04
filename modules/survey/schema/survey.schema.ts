import { z } from 'zod';

export const eventSchema = z.object({
    id: z.number(),
    name_kh: z.string(),
    type: z.string(),
    created_at: z.string().optional(),
});

export const organizationSchema = z.object({
    id: z.number(),
    name_kh: z.string(),
    type: z.string().optional(),
    code: z.string().optional(),
    created_at: z.string().optional(),
});

export const sportSchema = z.object({
    id: z.number(),
    sports_id: z.number(),
    name_kh: z.string(),
    sport_type: z.string().optional(),
    created_at: z.string().optional(),
});

export const sportEntrySchema = z.object({
    id: z.number(),
    name_kh: z.string(),
});

export const eventListResponseSchema = z.object({
    data: z.array(eventSchema),
});

export const sportListResponseSchema = z.object({
    data: z.array(sportEntrySchema),
});

export const organizationListResponseSchema = z.object({
    data: z.array(organizationSchema),
});

export const sportsEventResponseSchema = z.object({
    id: z.number(),
    event_name: z.string().optional(),
    sport_name: z.string().optional(),
    created_at: z.string().optional(),
});

export const surveyFormDataSchema = z.object({
    eventId: z.number().int().positive().nullable().refine(val => val !== null, { message: 'Event is required' }),
    organizationId: z.number().int().positive().nullable().refine(val => val !== null, { message: 'Organization is required' }),
    sportIds: z.array(z.number().int().positive()).min(1, 'Select at least one sport'),
});

export const surveySubmissionPayloadSchema = z.object({
    organization_id: z.number(),
    event_id: z.number(),
    sport_ids: z.array(z.number()),
});

export type Event = z.infer<typeof eventSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Sport = z.infer<typeof sportSchema>;
export type SurveyFormData = z.infer<typeof surveyFormDataSchema>;
export type SurveySubmissionPayload = z.infer<typeof surveySubmissionPayloadSchema>;

export { surveyFormDataSchema as surveySchema };
