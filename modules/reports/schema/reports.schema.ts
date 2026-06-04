import { z } from 'zod';

export const reportDownloadParamsSchema = z.object({
    event_id: z.number(),
    organization_id: z.number().optional(),
});

export type ReportDownloadParams = z.input<typeof reportDownloadParamsSchema>;
