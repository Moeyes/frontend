/**
 * Event Feature - Types
 */

export enum EventType {
    NATIONAL = "កីឡាជាតិ",
    UNIVERSITY = "កីឡាឧត្តមសិក្សា និងមធ្យមសិក្សា​បចេ្ចកទេសថ្នាក់ជាតិថ្នាក់ជាតិ",
    HIGH_SCHOOL = "សិស្សមធ្យមសិក្សា​ថ្នាក់ជាតិ",
    PRIMARY_SCHOOL = "កីឡាសិស្សបថមសិក្សាជាតិ",
}

export interface Event {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    event_type: EventType;
    location?: string;
    open_register_date?: string | null;
    close_register_date?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface EventCreate {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    event_type: EventType;
    location: string;
    open_register_date?: string | null;
    close_register_date?: string | null;
}

export interface EventUpdate extends Partial<EventCreate> {
    id: number;
    open_register_date?: string | null;
    close_register_date?: string | null;
}

export interface Organization {
    id: number;
    name_kh: string;
    name_en: string;
    code?: string;
    type?: string;
}

export interface Sport {
    id: number;        // sports_event.id (association ID — used for removal)
    sports_id: number; // Sport.id (actual sport ID — used for filtering)
    name_kh: string;
    name_en: string;
}

export interface Category {
    id: number;
    category: string;
    sport_name?: string;
    gender?: string;
}

export interface EventSport {
    id: number;
    event_id: number;
    sport_id: number;
    sport_name: string; // from join
}

export interface EventSportOrg {
    id: number;
    event_id: number;
    sport_id: number;
    org_id: number;
    org_name: string; // from join
}

export interface AddSportToEventPayload {
    event_id: number;
    sport_id: number;
}

export interface AddOrgToEventSportPayload {
    event_id: number;
    sport_id: number;
    org_id: number;
}

export interface DeleteEventSportOrgLinkPayload {
    association_id: number;
    // for cache invalidation only
    event_id: number;
    sport_id: number;
}

export interface RemoveOrgCompletelyFromEventPayload {
    event_id: number;
    org_id: number;
}
