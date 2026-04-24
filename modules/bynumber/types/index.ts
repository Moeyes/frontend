/**
 * ByNumber Feature Types
 * Handles organization participation registration with participant counts
 */
import type { ByNumberFormData as ByNumberSchemaData } from '../services/schema';
import type { ByNumberFormInput as ByNumberSchemaInput } from '../services/schema';

export interface Event {
    id: number;
    name_kh: string;
    type?: string;
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
    id: number;
    name_kh: string;
    sport_type?: string;
    created_at?: string;
}

export interface SportRow {
    sport_id: number;
    sport_name_kh: string;
    athlete_male_count: number;
    athlete_female_count: number;
    leader_male_count: number;
    leader_female_count: number;
    sportsEventOrgId?: number;
    // Aliases for sync
    maleCount?: number;
    femaleCount?: number;
}

export type ByNumberFormData = ByNumberSchemaData;
export type ByNumberFormInput = ByNumberSchemaInput;

export interface ParticipationPerSport {
    org_id: number;
    sports_Events_id: number;
    events_id: number;
    sports_id: number;
    organization_id: number;
    athlete_male_count: number;
    athlete_female_count: number;
    leader_male_count: number;
    leader_female_count: number;
}

export type ByNumberStep = 'event' | 'organization' | 'sports-count' | 'confirm' | 'completed';

export interface ByNumberContextType {
    formData: ByNumberFormData;
    setFields: (fields: Partial<ByNumberFormData>) => void;
    reset: () => void;
    initSports: (sports: SportRow[]) => void;
    setCount: (sportId: number, fieldName: string, value: number) => void;
}

export interface ByNumberValidationError {
    step: ByNumberStep;
    message: string;
}
