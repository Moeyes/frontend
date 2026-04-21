/**
 * Authentication Feature Types
 */

// Form data as collected from the user (includes UI-specific fields)
export interface RegisterFormData {
    // Context selection
    eventType: string | null;
    eventId: number | null;
    organizationId: number | null;
    sportId: number | null;
    categoryId: number | null;

    // Personal information
    khFamilyName: string;
    khGivenName: string;
    enFamilyName: string;
    enGivenName: string;
    gender: 'Male' | 'Female';
    dateOfBirth: string; // ISO date: YYYY-MM-DD
    nationality: string;
    phone: string;
    idDocumentType:
    | 'IDCard'
    | 'BirthCertificate'
    | 'Passport'
    | 'FamilyBook'
    | 'Other'
    | '';
    address?: string;

    // Role information
    role: 'Athlete' | 'Leader' | '';
    leaderRole?: string; // coach, manager, delegate, etc.

    // Document paths (Cloudinary URLs or file paths)
    photoPath?: string | null;
    birthCertificatePath?: string | null;
    nationalIdPath?: string | null;
    passportPath?: string | null;

    // Document upload toggles (UI-only, not sent to backend)
    _uploadPhoto?: boolean;
    _uploadId?: boolean;
    _uploadBirth?: boolean;
    _uploadPassport?: boolean;
}

// Maps idDocumentType to backend enum
const ID_DOC_TYPE_MAP: Record<string, string> = {
    IDCard: 'CAM_NID',
    BirthCertificate: 'CAM_BIRTH_CERT',
    Passport: 'CAM_PASSPORT',
    FamilyBook: 'CAM_FAMILY_BOOK',
    Other: 'OTHER',
};

// Request payload as sent to the backend
export interface RegisterPayload {
    eventType: string; // Event type from Events.type field
    eventId: number;
    organizationId: number;
    sportId: number;
    categoryId: number | null;
    lastNameKhmer: string;
    firstNameKhmer: string;
    lastNameLatin: string;
    firstNameLatin: string;
    gender: string; // normalized to uppercase by backend
    dateOfBirth: string; // ISO date: YYYY-MM-DD
    phone: string;
    idDocType: string; // mapped from UI type to backend enum
    role: string; // normalized to lowercase by backend
    leaderRole: string | null;
    address?: string;
    photoUrl?: string | null;
    nationalityDocumentUrl?: string | null;
    birthCertificateUrl?: string | null;
    nationalIdUrl?: string | null;
    passportUrl?: string | null;
}

// Success response from backend
export interface RegisterResponse {
    status?: string;
    enroll_id: number;
    uuid?: string | null;
}

// API error response (generic)
export interface ApiErrorResponse {
    detail: string | Array<ValidationError>;
}

// Validation error in 422 response
export interface ValidationError {
    type: string;
    loc: (string | number)[];
    msg: string;
    input: unknown;
}

// Normalized error for component consumption
export interface FieldError {
    field: string;
    message: string;
}

// Convert form data to API payload
export function formDataToPayload(formData: RegisterFormData): RegisterPayload {
    return {
        eventType: formData.eventType || '',
        eventId: formData.eventId || 0,
        organizationId: formData.organizationId || 0,
        sportId: formData.sportId || 0,
        categoryId: formData.categoryId || null,
        lastNameKhmer: formData.khFamilyName,
        firstNameKhmer: formData.khGivenName,
        lastNameLatin: formData.enFamilyName,
        firstNameLatin: formData.enGivenName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        idDocType: ID_DOC_TYPE_MAP[formData.idDocumentType] || 'OTHER',
        role: formData.role,
        leaderRole: formData.leaderRole || null,
        address: formData.address,
        photoUrl: formData.photoPath,
        birthCertificateUrl: formData.birthCertificatePath,
        nationalIdUrl: formData.nationalIdPath,
        passportUrl: formData.passportPath,
    };
}

// Parse API error response into field errors
export function parseApiError(
    error: ApiErrorResponse
): Map<string, string> | string {
    if (typeof error.detail === 'string') {
        return error.detail;
    }

    if (Array.isArray(error.detail)) {
        const fieldErrors = new Map<string, string>();
        error.detail.forEach((err) => {
            const field =
                err.loc && err.loc.length > 1
                    ? String(err.loc[err.loc.length - 1])
                    : 'unknown';
            fieldErrors.set(field, err.msg);
        });
        return fieldErrors;
    }

    return 'An unexpected error occurred';
}
