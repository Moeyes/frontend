import { z } from 'zod';

export const organizerSchema = z.object({
  // Event/Sport context
  event_id:    z.number({ message: 'participation.validation.eventRequired' }).positive(),
  sport_id:    z.number({ message: 'participation.validation.sportRequired' }).positive(),
  category_id: z.number().nullable().optional(),

  // Leader role (required for organizers — Red Line difference from athlete)
  leader_role: z.string().min(1, { message: 'participation.validation.leaderRoleRequired' }),

  // Personal info
  kh_family_name: z.string().min(1, { message: 'participation.validation.nameRequired' }),
  kh_given_name:  z.string().min(1, { message: 'participation.validation.nameRequired' }),
  en_family_name: z.string().min(1, { message: 'participation.validation.nameRequired' }),
  en_given_name:  z.string().min(1, { message: 'participation.validation.nameRequired' }),
  gender:         z.enum(['MALE', 'FEMALE'], { message: 'participation.validation.genderRequired' }),
  date_of_birth:  z.string().min(1, { message: 'participation.validation.dobRequired' }),
  phone:          z.string().optional(),
  address:        z.string().optional(),

  // Documents (validated by age at event date — see OrganizerForm)
  photoUrl:            z.string().optional().nullable(),
  birthCertificateUrl: z.string().optional().nullable(),
  nationalIdUrl:       z.string().optional().nullable(),
  passportUrl:         z.string().optional().nullable(),
});

export type OrganizerFormValues = z.infer<typeof organizerSchema>;
