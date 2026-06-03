import apiClient from "@/core/api/client";
import {
  Sport,
  SportCreate,
  SportUpdate,
  Category,
  AddCategoryBody,
  UpdateCategoryBody,
  DeleteCategoryBody,
  ParticipantRole,
  SportParticipant,
  SportParticipantListResponse,
} from "../types";

const BASE_URL = "/api/sports";

function buildUrl(path: string): string {
  const base =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://localhost:8000")
      : "";
  return `${base}${path}`;
}

type ApiCollectionResponse<T> = T[] | { data?: T[] };
type ApiItemResponse<T> = T | { data?: T };

function extractCollection<T>(payload: ApiCollectionResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
}

function extractItem<T>(payload: ApiItemResponse<T>): T {
  return (
    typeof payload === "object" && payload !== null && "data" in payload
      ? payload.data
      : payload
  ) as T;
}

/**
 * Get all sports
 */
export async function getSports(): Promise<Sport[]> {
  const response = await apiClient.get<ApiCollectionResponse<Sport>>(
    buildUrl(`${BASE_URL}/`),
  );
  return extractCollection(response.data);
}

/**
 * Get single sport by ID
 */
export async function getSportById(sportId: number): Promise<Sport> {
  const path =
    typeof window === "undefined"
      ? `/api/public/sports/${sportId}`
      : `${BASE_URL}/${sportId}`;
  const { data } = await apiClient.get<ApiItemResponse<Sport>>(buildUrl(path));
  return extractItem(data);
}

/**
 * Create a new sport
 */
export async function createSport(sportData: SportCreate): Promise<Sport> {
  const { data } = await apiClient.post<ApiItemResponse<Sport>>(
    buildUrl(`${BASE_URL}/`),
    sportData,
  );
  return extractItem(data);
}

/**
 * Update an existing sport
 */
export async function updateSport(sportData: SportUpdate): Promise<Sport> {
  const { id, ...payload } = sportData;
  const { data } = await apiClient.patch<ApiItemResponse<Sport>>(
    buildUrl(`${BASE_URL}/${id}`),
    payload,
  );
  return extractItem(data);
}

/**
 * Delete a sport
 */
export async function deleteSport(sportId: number): Promise<void> {
  await apiClient.delete(buildUrl(`${BASE_URL}/${sportId}`));
}

/**
 * List participants (athletes or leaders) for a sport.
 * Backend scopes ORGANIZATION users to their own org automatically; the
 * `role` query param is required and selects athlete vs leader.
 */
export async function getSportParticipants(params: {
  role: ParticipantRole;
  sportId: number;
  eventId?: number;
  organizationId?: number;
  limit?: number;
}): Promise<SportParticipant[]> {
  const { data } = await apiClient.get<SportParticipantListResponse>(
    buildUrl(`/api/participant/`),
    {
      params: {
        role: params.role,
        sport_id: params.sportId,
        event_id: params.eventId,
        organization_id: params.organizationId,
        limit: params.limit ?? 200,
      },
    },
  );
  return data?.data ?? [];
}

/**
 * Get single category by ID
 */
export async function getCategoryById(categoryId: number): Promise<Category> {
  const { data } = await apiClient.get<ApiItemResponse<Category>>(
    buildUrl(`${BASE_URL}/category/${categoryId}`),
  );
  return extractItem(data);
}

/**
 * Add a new category to a sport
 */
export async function addCategory(
  categoryData: AddCategoryBody,
): Promise<Category> {
  const { data } = await apiClient.post<ApiItemResponse<Category>>(
    buildUrl(`${BASE_URL}/category`),
    categoryData,
  );
  return extractItem(data);
}

/**
 * Delete a category
 */
export async function deleteCategory(
  payload: DeleteCategoryBody,
): Promise<void> {
  await apiClient.delete(buildUrl(`${BASE_URL}/category`), { data: payload });
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryData: UpdateCategoryBody,
): Promise<Category> {
  const { data } = await apiClient.patch<ApiItemResponse<Category>>(
    buildUrl(`${BASE_URL}/category`),
    categoryData,
  );
  return extractItem(data);
}

/**
 * Get categories for a specific sport
 */
export async function getCategoriesBySportId(
  sportId: number,
): Promise<Category[]> {
  const response = await apiClient.get<ApiCollectionResponse<Category>>(
    buildUrl(`${BASE_URL}/${sportId}/categories`),
  );
  return extractCollection(response.data);
}

export const sportsService = {
  getSports,
  getSportById,
  createSport,
  updateSport,
  deleteSport,
  getSportParticipants,
  getCategoryById,
  addCategory,
  deleteCategory,
  updateCategory,
  getCategoriesBySportId,
};

export default sportsService;
