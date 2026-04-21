/**
 * Survey Feature Types
 * Handles organization participation registration in sports for events
 */

export interface Event {
    id: number;
    name_kh: string;
    type: string;
    created_at?: string;
}

export interface Organization {
    id: number;
    name_kh: string;
    type?: string;
    code?: string;
    created_at?: string;
}

export interface Sport {
    id: number;          // Join table ID (sports_event.id)
    sports_id: number;   // Actual Sport ID (sports.id)
    name_kh: string;
    sport_type?: string;
    created_at?: string;
}

export interface SurveyFormData {
    eventId: number | null;
    organizationId: number | null;
    sportIds: number[]; // This will store sports_id (actual sport IDs)
}

export interface SurveyFormPayload {
    org_id: number;
    event_id: number;
    sport_ids: number[];
}

export interface SurveySportLink {
    id: number;
    events_id: number;
    sports_id: number;
    organization_id: number;
    created_at: string;
}

export type SurveyStep = 'event' | 'organization' | 'sports' | 'confirm' | 'completed';

export interface SurveyContextType {
    formData: SurveyFormData;
    setFields: (fields: Partial<SurveyFormData>) => void;
    reset: () => void;
}

export interface SurveyValidationError {
    step: SurveyStep;
    message: string;
}
