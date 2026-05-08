import { z } from 'zod';
import { EVENT_TYPES } from './events.service';

export const eventSchema = z.object({
  name_kh:             z.string().min(1, { message: 'events.validation.nameRequired' }),
  type:                z.enum(EVENT_TYPES as [string, ...string[]], {
    message: 'events.validation.typeRequired',
  }),
  description:         z.string().optional().nullable(),
  start_date:          z.string().optional().nullable(),
  end_date:            z.string().optional().nullable(),
  location:            z.string().optional().nullable(),
  open_register_date:  z.string().optional().nullable(),
  close_register_date: z.string().optional().nullable(),
}).refine(
  (d) => !d.start_date || !d.end_date || d.start_date <= d.end_date,
  { message: 'events.validation.dateRangeInvalid', path: ['end_date'] }
);

export type EventFormValues = z.infer<typeof eventSchema>;
