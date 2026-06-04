import { z } from 'zod';

export const dashboardStatsSchema = z.object({
    events: z.number(),
    sports: z.number(),
    participants: z.number(),
    registrations: z.number(),
    organizations: z.number(),
    athletes: z.number(),
    leaders: z.number(),
});

export const genderDistributionSchema = z.object({
    male: z.number(),
    female: z.number(),
    other: z.number(),
});

export const topOrganizationSchema = z.object({
    name: z.string(),
    participants: z.number(),
    type: z.string(),
});

export const recentEnrollmentSchema = z.object({
    id: z.number(),
    kh_name: z.string(),
    en_name: z.string(),
    sport_name: z.string(),
    gender: z.string(),
    phone: z.string(),
    createdAt: z.string(),
});

export const dashboardDataSchema = z.object({
    stats: dashboardStatsSchema,
    genderDistribution: genderDistributionSchema,
    topOrganizations: z.array(topOrganizationSchema),
    recentEnrollments: z.array(recentEnrollmentSchema),
});

export const dashboardResponseSchema = z.object({
    success: z.boolean(),
    data: dashboardDataSchema,
});

export const dashboardQueryParamsSchema = z.object({
    orgId: z.number().optional(),
    categoryId: z.number().optional(),
}).optional();

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type GenderDistribution = z.infer<typeof genderDistributionSchema>;
export type TopOrganization = z.infer<typeof topOrganizationSchema>;
export type RecentEnrollment = z.infer<typeof recentEnrollmentSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
export type DashboardQueryParams = z.input<typeof dashboardQueryParamsSchema>;
