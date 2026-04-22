/**
 * Sport Feature - Types
 */

export interface Sport {
    id: number;
    name_kh: string;
    name_en?: string;
    description?: string;
    sport_type?: string;
    created_at?: string;
    updated_at?: string;
    // Calculated fields or from join
    category_count?: number;
}

export interface SportCreate {
    name_kh: string;
    name_en?: string;
    description?: string;
    sport_type?: string;
}

export enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
}

export interface Category {
    id: number;
    sport_id: number;
    category: string;
    gender?: Gender | null;
    age_min?: number | null;
    age_max?: number | null;
    created_at?: string;
    updated_at?: string;
    sport_name?: string;
}

export interface AddCategoryBody {
    sport_id: number;
    category: string;
    gender?: Gender | null;
    age_min?: number | null;
    age_max?: number | null;
}

export interface UpdateCategoryBody extends Partial<AddCategoryBody> {
    id: number;
}

export interface DeleteCategoryBody {
    category_id: number;
}

export interface SportUpdate extends Partial<SportCreate> {
    id: number;
}
