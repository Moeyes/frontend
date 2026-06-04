import * as z from 'zod';

export const participationSchema = z.object({
    id: z.number().int(),
    enroll_id: z.number().int(),
    sport_id: z.number().int(),
    event_id: z.number().int(),
    org_id: z.number().int().optional(),
    category_id: z.number().int().nullable().optional(),
    created_at: z.string(),

    status: z.string().optional(),
    review_note: z.string().nullable().optional(),
    reviewed_at: z.string().nullable().optional(),

    athlete_male_count: z.number().int().nullable().optional(),
    athlete_female_count: z.number().int().nullable().optional(),
    leader_male_count: z.number().int().nullable().optional(),
    leader_female_count: z.number().int().nullable().optional(),

    org_name: z.string().optional(),
    event_name: z.string().optional(),
    sport_name: z.string().optional(),
    category_name: z.string().optional(),
    participant_name: z.string().optional(),
}).strict();

export type ParticipationParsed = z.infer<typeof participationSchema>;

export const participationListSchema = z.object({
    data: participationSchema.array(),
    count: z.number().int().nonnegative(),
}).strict();

export type ParticipationListParsed = z.infer<typeof participationListSchema>;
