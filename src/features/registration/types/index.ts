/**
 * Registration Types
 *
 * Payload field names must match the backend FullRegistrationRequest aliases exactly.
 *
 * Backend aliases (what we must send):
 *   kh_family_name  ← alias: lastNameKhmer
 *   kh_given_name   ← alias: firstNameKhmer
 *   en_family_name  ← alias: lastNameLatin
 *   en_given_name   ← alias: firstNameLatin
 *   date_of_birth   ← alias: dateOfBirth
 *   id_document_type← alias: idDocType
 *   phone           ← alias: phone (same)
 */

import { RegisterFormData } from '@/lib/validators/register.schema';

// ─── API Payload ─────────────────────────────────────────────────────────────
// Must match backend FullRegistrationRequest exactly

export interface RegisterPayload {
    // Authenticated user registering this participant
    userId: string;

    // Event context
    eventId: number;
    organizationId: number;
    sportId: number;
    categoryId?: number | null;

    // Personal info — using backend aliases
    lastNameKhmer: string;
    firstNameKhmer: string;
    lastNameLatin: string;
    firstNameLatin: string;
    phone: string;
    gender: string;
    dateOfBirth: string;        
    idDocType: string;          
    address?: string;
    nationality?: string;

    // Role
    role: string;
    leaderRole?: string | null;

    // Document URLs
    photoUrl?: string | null;
    birthCertificateUrl?: string | null;
    nationalIdUrl?: string | null;
    passportUrl?: string | null;
    nationalityDocumentUrl?: string | null;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface RegisterResponse {
    status: string;
    enroll_id: number;
    user_id: string;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
    detail?: string | FieldError[];
}

interface FieldError {
    loc: string[];
    msg: string;
    type: string;
}

// ─── Payload Transformer ──────────────────────────────────────────────────────

export function formDataToPayload(data: RegisterFormData, userId: string): RegisterPayload {
    return {
        // Authenticated user registering this participant
        userId,

        // Event context
        eventId: data.eventId as number,
        organizationId: Number(data.organizationId), // backend expects int
        sportId: data.sportId as number,
        categoryId: data.categoryId ?? null,

        // Personal info — map to backend aliases
        lastNameKhmer: data.khFamilyName,
        firstNameKhmer: data.khGivenName,
        lastNameLatin: data.enFamilyName,
        firstNameLatin: data.enGivenName,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        idDocType: data.idDocumentType,
        address: data.address,
        nationality: data.nationality,

        // Role
        role: data.role,
        leaderRole: data.leaderRole || null,

        // Document URLs — *Path → *Url
        photoUrl: data.photoPath ?? null,
        birthCertificateUrl: data.birthCertificatePath ?? null,
        nationalIdUrl: data.nationalIdPath ?? null,
        passportUrl: data.passportPath ?? null,
        nationalityDocumentUrl: null,
    };
}

// ─── Error Parser ─────────────────────────────────────────────────────────────

export function parseApiError(error: ApiErrorResponse): string | Map<string, string> {
    const detail = error?.detail;

    // Plain string error
    if (typeof detail === 'string') {
        return detail;
    }

    // FastAPI validation errors: array of { loc, msg }
    if (Array.isArray(detail)) {
        const map = new Map<string, string>();
        detail.forEach((err) => {
            const field = err.loc[err.loc.length - 1]; // last segment is the field name
            map.set(field, err.msg);
        });
        return map;
    }

    return 'An unexpected error occurred. Please try again.';
}