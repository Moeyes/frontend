import apiClient from "@/core/api/client";
import {
  Event,
  EventCreate,
  EventUpdate,
  Sport,
  Organization,
  Category,
  AddSportToEventPayload,
  AddOrgToEventSportPayload,
  DeleteEventSportOrgLinkPayload,
  RemoveOrgCompletelyFromEventPayload,
  PhaseFields,
  PhaseUpdatePayload,
} from "../types";

/** Per-phase keys that pass straight through to the backend (names match). */
const PHASE_KEYS = [
  "survey_category_status", "survey_category_open_date", "survey_category_close_date",
  "survey_sport_status", "survey_sport_open_date", "survey_sport_close_date",
  "survey_number_status", "survey_number_open_date", "survey_number_close_date",
  "registration_status", "registration_open_date", "registration_close_date",
] as const;

/** Collect the defined phase fields, normalising "" -> null for dates. */
function phasePayload(src: Partial<PhaseFields>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of PHASE_KEYS) {
    const value = (src as Record<string, unknown>)[key];
    if (value !== undefined) out[key] = value === "" ? null : value;
  }
  return out;
}

// ─── Raw API Shape ────────────────────────────────────────────────────────────

/** Shape returned directly from the backend before mapping */
interface RawApiEvent {
  id: number;
  name_kh?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  type?: string;
  event_type?: string;
  location?: string;
  age_mode?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  // Per-phase status + AUTO date window.
  survey_category_status?: string;
  survey_category_open_date?: string | null;
  survey_category_close_date?: string | null;
  survey_sport_status?: string;
  survey_sport_open_date?: string | null;
  survey_sport_close_date?: string | null;
  survey_number_status?: string;
  survey_number_open_date?: string | null;
  survey_number_close_date?: string | null;
  registration_status?: string;
  registration_open_date?: string | null;
  registration_close_date?: string | null;
  // Computed gates.
  survey_category_is_open?: boolean;
  survey_sport_is_open?: boolean;
  survey_number_is_open?: boolean;
  registration_is_open?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface RawApiSport {
  id: number;
  sports_id?: number;
  event_name?: string;
  sport_name?: string;
  created_at?: string;
}

export async function listEventSports(eventId: number): Promise<Sport[]> {
  const [{ data: sportsData }, { data: allSportsData }] = await Promise.all([
    apiClient.get<ApiCollectionResponse<RawApiSport>>(
      buildUrl(`${EVENT_PATH}/${eventId}/sports`),
    ),
    apiClient.get<ApiCollectionResponse<{ id: number; name_kh: string }>>(
      buildUrl("/api/sports"),
    ),
  ]);
  const allSports = extractCollection(allSportsData);
  return extractCollection(sportsData).map((apiSport) => {
    const matched = allSports.find((s) => s.name_kh === apiSport.sport_name);
    return {
      id: apiSport.id,
      sports_id: apiSport.sports_id ?? matched?.id ?? apiSport.id,
      name_kh: apiSport.sport_name ?? "Unnamed Sport",
      name_en: apiSport.sport_name ?? "Unnamed Sport",
    };
  });
}

// ─── URL Helper ───────────────────────────────────────────────────────────────

const EVENT_PATH = "/api/events";

function buildUrl(path: string): string {
  // On the server (SSG/SSR) there is no `window` — use the configured
  // public API URL or fall back to the backend dev port 8000.
  const base =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://localhost:8000")
      : "";
  return `${base}${path}`;
}

// ─── Response Extractors ──────────────────────────────────────────────────────

type ApiCollectionResponse<T> = T[] | { data?: T[] };
type ApiItemResponse<T> = T | { data?: T };

function extractCollection<T>(payload: ApiCollectionResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data;
  }
  return [];
}

function extractItem<T>(payload: ApiItemResponse<T>): T {
  return (
    typeof payload === "object" && payload !== null && "data" in payload
      ? payload.data
      : payload
  ) as T;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapApiEvent(apiEvent: RawApiEvent): Event {
  return {
    id: apiEvent.id,
    name: apiEvent.name_kh || "Unnamed Event",
    description: apiEvent.description || "",
    start_date: apiEvent.start_date || "",
    end_date: apiEvent.end_date || "",
    event_type: (apiEvent.type ?? apiEvent.event_type) as Event["event_type"],
    location: apiEvent.location || "",
    age_mode: (apiEvent.age_mode ?? null) as Event["age_mode"],
    age_min: apiEvent.age_min ?? null,
    age_max: apiEvent.age_max ?? null,
    // Per-phase status + window (passthrough — names already match).
    survey_category_status: apiEvent.survey_category_status as Event["survey_category_status"],
    survey_category_open_date: apiEvent.survey_category_open_date ?? null,
    survey_category_close_date: apiEvent.survey_category_close_date ?? null,
    survey_sport_status: apiEvent.survey_sport_status as Event["survey_sport_status"],
    survey_sport_open_date: apiEvent.survey_sport_open_date ?? null,
    survey_sport_close_date: apiEvent.survey_sport_close_date ?? null,
    survey_number_status: apiEvent.survey_number_status as Event["survey_number_status"],
    survey_number_open_date: apiEvent.survey_number_open_date ?? null,
    survey_number_close_date: apiEvent.survey_number_close_date ?? null,
    registration_status: apiEvent.registration_status as Event["registration_status"],
    registration_open_date: apiEvent.registration_open_date ?? null,
    registration_close_date: apiEvent.registration_close_date ?? null,
    // Computed gates.
    survey_category_is_open: apiEvent.survey_category_is_open,
    survey_sport_is_open: apiEvent.survey_sport_is_open,
    survey_number_is_open: apiEvent.survey_number_is_open,
    registration_is_open: apiEvent.registration_is_open,
    created_at: apiEvent.created_at,
    updated_at: apiEvent.updated_at,
  };
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getEvents(): Promise<Event[]> {
  const { data } = await apiClient.get<ApiCollectionResponse<RawApiEvent>>(
    buildUrl(`${EVENT_PATH}/`),
  );
  return extractCollection(data).map(mapApiEvent);
}

export async function getEventById(eventId: number): Promise<Event> {
  const path =
    typeof window === 'undefined' ? `/api/public/events/${eventId}` : `${EVENT_PATH}/${eventId}`;
  const { data } = await apiClient.get<ApiItemResponse<RawApiEvent>>(buildUrl(path));
  return mapApiEvent(extractItem(data));
}

export async function createEvent(eventData: EventCreate): Promise<Event> {
  const { data } = await apiClient.post<ApiItemResponse<RawApiEvent>>(
    buildUrl(`${EVENT_PATH}/`),
    {
      name_kh: eventData.name,
      type: eventData.event_type,
      description: eventData.description || null,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      location: eventData.location || null,
      age_mode: eventData.age_mode,
      age_min: eventData.age_min,
      age_max: eventData.age_max,
      ...phasePayload(eventData),
    },
  );
  return mapApiEvent(extractItem(data));
}

export async function updateEvent(eventData: EventUpdate): Promise<Event> {
  const { id, name, event_type, description, start_date, end_date, location, age_mode, age_min, age_max } =
    eventData;
  const payload: Record<string, unknown> = { ...phasePayload(eventData) };
  if (name !== undefined) payload.name_kh = name ?? null;
  if (event_type !== undefined) payload.type = event_type ?? null;
  if (description !== undefined) payload.description = description || null;
  if (start_date !== undefined) payload.start_date = start_date || null;
  if (end_date !== undefined) payload.end_date = end_date || null;
  if (location !== undefined) payload.location = location || null;
  if (age_mode !== undefined) payload.age_mode = age_mode;
  if (age_min !== undefined) payload.age_min = age_min;
  if (age_max !== undefined) payload.age_max = age_max;

  const { data } = await apiClient.patch<ApiItemResponse<RawApiEvent>>(
    buildUrl(`${EVENT_PATH}/${id}`),
    payload,
  );
  return mapApiEvent(extractItem(data));
}

/** Quick action: force a single phase OPEN/CLOSED/AUTO (admin only). */
export async function updateEventPhase(
  payload: PhaseUpdatePayload,
): Promise<Event> {
  const { id, phase, status, open_date, close_date } = payload;
  const { data } = await apiClient.patch<ApiItemResponse<RawApiEvent>>(
    buildUrl(`${EVENT_PATH}/${id}/phase`),
    {
      phase,
      status,
      open_date: open_date || null,
      close_date: close_date || null,
    },
  );
  return mapApiEvent(extractItem(data));
}

export async function deleteEvent(eventId: number): Promise<void> {
  await apiClient.delete(buildUrl(`${EVENT_PATH}/delete`), {
    data: { event_id: eventId },
  });
}

export async function addSportToEvent(
  payload: AddSportToEventPayload,
): Promise<void> {
  await apiClient.post(buildUrl(`${EVENT_PATH}/add-sport`), {
    events_id: payload.event_id,
    sports_id: payload.sport_id,
  });
}

// export async function listEventSports(eventId: number): Promise<Sport[]> {
//     const { data } = await apiClient.get<ApiCollectionResponse<Sport>>(
//         buildUrl(`${EVENT_PATH}/${eventId}/sports`)
//     );
//     return extractCollection(data);
// }

export async function removeSportFromEvent(
  associationId: number,
): Promise<void> {
  await apiClient.delete(buildUrl(`${EVENT_PATH}/remove-sport-from-event`), {
    data: { association_id: associationId },
  });
}

export async function addOrgToEventSport(
  payload: AddOrgToEventSportPayload,
): Promise<void> {
  await apiClient.post(buildUrl(`${EVENT_PATH}/add-org-to-sport`), {
    events_id: payload.event_id,
    sports_id: payload.sport_id,
    org_id: payload.org_id,
  });
}

interface RawApiSportOrg {
  id: number;
  organization_id: number;
  organization_name: string;
}

export async function listEventSportOrgs(
  eventId: number,
  sportId: number,
): Promise<Organization[]> {
  const { data } = await apiClient.get<ApiCollectionResponse<RawApiSportOrg>>(
    buildUrl(`${EVENT_PATH}/${eventId}/sports/${sportId}/orgs`),
  );
  return extractCollection(data).map(
    (o) =>
      ({
        id: o.organization_id,
        name_kh: o.organization_name,
        name_en: o.organization_name,
        _linkId: o.id,
      }) as Organization & { _linkId: number },
  );
}

export async function listEventSportCategories(
  eventId: number,
  sportId: number,
): Promise<Category[]> {
  const { data } = await apiClient.get<ApiCollectionResponse<Category>>(
    buildUrl(`${EVENT_PATH}/${eventId}/sports/${sportId}/categories`),
  );
  return extractCollection(data);
}

export async function deleteEventSportOrgLink(
  payload: DeleteEventSportOrgLinkPayload,
): Promise<void> {
  await apiClient.delete(
    buildUrl(`${EVENT_PATH}/delete-event-sport-org-link`),
    {
      data: { association_id: payload.association_id },
    },
  );
}

export async function listUniqueOrgsInEvent(
  eventId: number,
): Promise<Organization[]> {
  const { data } = await apiClient.get<ApiCollectionResponse<Organization>>(
    buildUrl(`${EVENT_PATH}/${eventId}/organizations`),
  );
  return extractCollection(data);
}

export async function removeOrgCompletelyFromEvent(
  payload: RemoveOrgCompletelyFromEventPayload,
): Promise<void> {
  await apiClient.delete(
    buildUrl(`${EVENT_PATH}/remove-org-completely-from-event`),
    {
      data: payload,
    },
  );
}

// ─── Named Export ─────────────────────────────────────────────────────────────

export const eventsService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  addSportToEvent,
  listEventSports,
  removeSportFromEvent,
  addOrgToEventSport,
  listEventSportOrgs,
  listEventSportCategories,
  deleteEventSportOrgLink,
  listUniqueOrgsInEvent,
  removeOrgCompletelyFromEvent,
};

export default eventsService;
