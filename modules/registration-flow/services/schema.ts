import { z } from 'zod';

export const eventSportStepSchema = z.object({
  event_id:    z.number({ message: 'registration.validation.eventRequired' }).positive(),
  sport_id:    z.number({ message: 'registration.validation.sportRequired' }).positive(),
  category_id: z.number().nullable().optional(),
  role:        z.enum(['athlete', 'leader']),
  leader_role: z.string().nullable().optional(),
});

export const personalInfoStepSchema = z.object({
  kh_family_name: z.string().min(1, { message: 'registration.validation.khFamilyNameRequired' }),
  kh_given_name:  z.string().min(1, { message: 'registration.validation.khGivenNameRequired' }),
  en_family_name: z.string().min(1, { message: 'registration.validation.enFamilyNameRequired' }),
  en_given_name:  z.string().min(1, { message: 'registration.validation.enGivenNameRequired' }),
  gender:         z.enum(['MALE', 'FEMALE'], { message: 'registration.validation.genderRequired' }),
  date_of_birth:  z.string().min(1, { message: 'registration.validation.dobRequired' }),
  nationality:    z.string().min(1, { message: 'registration.validation.nationalityRequired' }),
  phone:          z.string().optional(),
  address:        z.string().optional(),
});

export const documentStepSchema = z.object({
  photoUrl:             z.string().optional().nullable(),
  birthCertificateUrl:  z.string().optional().nullable(),
  nationalIdUrl:        z.string().optional().nullable(),
  passportUrl:          z.string().optional().nullable(),
});

export type EventSportStepValues   = z.infer<typeof eventSportStepSchema>;
export type PersonalInfoStepValues = z.infer<typeof personalInfoStepSchema>;
export type DocumentStepValues     = z.infer<typeof documentStepSchema>;
