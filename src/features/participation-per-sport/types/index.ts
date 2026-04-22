/**
 * Participation Per Sport Types
 */

export interface ParticipationPerSport {
    id: number;
    enroll_id: number;
    sport_id: number;
    event_id: number;
    category_id?: number | null;
    created_at: string;
    
    // Enriched fields from backend
    org_name?: string;
    event_name?: string;
    sport_name?: string;
    category_name?: string;
    participant_name?: string;
}

export interface ParticipationPerSportPayload {
    enroll_id: number;
    sport_id: number;
    event_id: number;
    category_id?: number | null;
}

export interface ParticipationPerSportListResponse {
    data: ParticipationPerSport[];
    count: number;
}
