import { z } from 'zod';

const sportCountSchema = z.object({
    sport_id: z.number().int().positive(),
    sport_name_kh: z.string().min(1),
    athlete_male_count: z.number().int().min(0),
    athlete_female_count: z.number().int().min(0),
    leader_male_count: z.number().int().min(0),
    leader_female_count: z.number().int().min(0),
    sportsEventOrgId: z.number().int().optional(),
    maleCount: z.number().int().optional(),
    femaleCount: z.number().int().optional(),
});

export const byNumberSchema = z.object({
    eventId: z.number().int().positive('Event is required').nullable(),
    organizationId: z.number().int().positive('Organization is required').nullable(),
    sports: z.array(sportCountSchema)
        .min(1, 'Select at least one sport')
        .refine(
            (sports) => {
                return sports.some((sport) => {
                    const total = sport.athlete_male_count + sport.athlete_female_count +
                        sport.leader_male_count + sport.leader_female_count;
                    return total > 0;
                });
            },
            { message: 'At least one sport must have participant counts' }
        ),
    eventName: z.string().optional(),
    organizationName: z.string().optional(),
    sportSelections: z.array(z.number()).optional(),
});

export type ByNumberFormInput = z.input<typeof byNumberSchema>;
export type ByNumberFormData = z.output<typeof byNumberSchema>;
