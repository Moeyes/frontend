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

export interface Enrollment {
    id: number;
    user_id: string;
    event_id: number;
    organization_id: number;
    sport_id: number;
    category_id?: number | null;
    kh_family_name: string;
    kh_given_name: string;
    en_family_name: string;
    en_given_name: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    id_document_type: string;
    address?: string;
    nationality?: string;
    role: string;
    leader_role?: string | null;
    photo_url?: string | null;
    birth_certificate_url?: string | null;
    national_id_url?: string | null;
    passport_url?: string | null;
    created_at: string;
    event_name?: string;
    org_name?: string;
    sport_name?: string;
    category_name?: string;
}

export interface EnrollmentListResponse {
    data: Enrollment[];
    count: number;
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

export { formDataToPayload, parseApiError } from '../mappers/registration.mapper';