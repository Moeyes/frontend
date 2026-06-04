import type { SurveyFormData as SurveyFormDataType } from '../schema/survey.schema';

export type { Event, Organization, Sport } from '../schema/survey.schema';

export type SurveyFormData = SurveyFormDataType;

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
