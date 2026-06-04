/**
 * organizations.schema.ts
 *
 * Single source of truth for runtime shape validation in the organizations
 * module. Every adapter response is parsed through these schemas before leaving
 * the data layer. All object schemas use .strict() so unexpected keys from a
 * changed backend surface as errors rather than silent drift.
 *
 * Also used by OrgForm (via zodResolver) for client-side UX validation.
 *
 * Organization data is Internal/Confidential (no PII) — normal caching applies.
 */

import * as z from 'zod';
import { InstituteType } from '../types';

// ─── API response schemas (adapter boundary) ─────────────────────────────────

/**
 * Matches backend OrganizationPublic: { id, name_kh, type, code, created_at }.
 * .strict() rejects any extra key so a backend change is a loud error.
 *
 * name_en / province / updated_at are NOT returned by the current backend, but
 * the list/form UI references them; kept optional so strict() accepts real
 * responses while the components compile and behave unchanged (always absent →
 * same render).
 */
export const organizationPublicSchema = z
    .object({
        id:         z.number().int(),
        name_kh:    z.string().min(1).max(100),
        type:       z.nativeEnum(InstituteType),
        code:       z.string().max(10).nullable().optional(),
        created_at: z.string(),
        name_en:    z.string().nullable().optional(),
        province:   z.string().nullable().optional(),
        updated_at: z.string().nullable().optional(),
    })
    .strict();

export type OrganizationPublic = z.infer<typeof organizationPublicSchema>;

/** Matches backend OrganizationsPublic (list envelope). */
export const organizationsPublicSchema = z
    .object({
        data:  organizationPublicSchema.array(),
        count: z.number().int().nonnegative(),
    })
    .strict();

export type OrganizationsPublic = z.infer<typeof organizationsPublicSchema>;

// ─── Form / mutation input schema ────────────────────────────────────────────

export const orgFormSchema = z.object({
    name_kh:  z.string().min(2),
    name_en:  z.string().optional().or(z.literal('')),
    type:     z.nativeEnum(InstituteType),
    code:     z.string().optional().or(z.literal('')),
    province: z.string().optional().or(z.literal('')),
});

export type OrgFormValues = z.infer<typeof orgFormSchema>;

// ─── Enum options (SelectField in OrgForm) ───────────────────────────────────

/** value + i18n label key; OrgForm runs labelKey through useTranslations('organizations'). */
export const instituteTypeOptions = [
    { value: InstituteType.PROVINCE, labelKey: 'types.PROVINCE' },
    { value: InstituteType.MINISTRY, labelKey: 'types.MINISTRY' },
] as const;
