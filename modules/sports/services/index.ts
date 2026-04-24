import apiClient from '@/core/api/client';
import { 
    Sport, 
    SportCreate, 
    SportUpdate, 
    Category, 
    AddCategoryBody, 
    UpdateCategoryBody, 
    DeleteCategoryBody 
} from '../types';

const BASE_URL = '/api/sports';

type ApiCollectionResponse<T> = T[] | { data?: T[] };
type ApiItemResponse<T> = T | { data?: T };

function extractCollection<T>(payload: ApiCollectionResponse<T>): T[] {
    if (Array.isArray(payload)) return payload;
    if (payload.data && Array.isArray(payload.data)) return payload.data;
    return [];
}

function extractItem<T>(payload: ApiItemResponse<T>): T {
    return (typeof payload === 'object' && payload !== null && 'data' in payload
        ? payload.data
        : payload) as T;
}

/**
 * Get all sports
 */
export async function getSports(): Promise<Sport[]> {
    const response = await apiClient.get<ApiCollectionResponse<Sport>>(`${BASE_URL}/`);
    return extractCollection(response.data);
}

/**
 * Get single sport by ID
 */
export async function getSportById(sportId: number): Promise<Sport> {
    const { data } = await apiClient.get<ApiItemResponse<Sport>>(`${BASE_URL}/${sportId}`);
    return extractItem(data);
}

/**
 * Create a new sport
 */
export async function createSport(sportData: SportCreate): Promise<Sport> {
    const { data } = await apiClient.post<ApiItemResponse<Sport>>(`${BASE_URL}/`, sportData);
    return extractItem(data);
}

/**
 * Update an existing sport
 */
export async function updateSport(sportData: SportUpdate): Promise<Sport> {
    const { id, ...payload } = sportData;
    const { data } = await apiClient.patch<ApiItemResponse<Sport>>(`${BASE_URL}/${id}`, payload);
    return extractItem(data);
}

/**
 * Get single category by ID
 */
export async function getCategoryById(categoryId: number): Promise<Category> {
    const { data } = await apiClient.get<ApiItemResponse<Category>>(`${BASE_URL}/category/${categoryId}`);
    return extractItem(data);
}

/**
 * Add a new category to a sport
 */
export async function addCategory(categoryData: AddCategoryBody): Promise<Category> {
    const { data } = await apiClient.post<ApiItemResponse<Category>>(`${BASE_URL}/category`, categoryData);
    return extractItem(data);
}

/**
 * Delete a category
 */
export async function deleteCategory(payload: DeleteCategoryBody): Promise<void> {
    await apiClient.delete(`${BASE_URL}/category`, { data: payload });
}

/**
 * Update a category
 */
export async function updateCategory(categoryData: UpdateCategoryBody): Promise<Category> {
    const { data } = await apiClient.patch<ApiItemResponse<Category>>(`${BASE_URL}/category`, categoryData);
    return extractItem(data);
}

/**
 * Get categories for a specific sport
 */
export async function getCategoriesBySportId(sportId: number): Promise<Category[]> {
    const response = await apiClient.get<ApiCollectionResponse<Category>>(`${BASE_URL}/${sportId}/categories`);
    return extractCollection(response.data);
}

export const sportsService = {
    getSports,
    getSportById,
    createSport,
    updateSport,
    getCategoryById,
    addCategory,
    deleteCategory,
    updateCategory,
    getCategoriesBySportId,
};

export default sportsService;
