/**
 * Organization Feature - Types
 */

export enum InstituteType {
    PROVINCE = "province",
    MINISTRY = "ministry",
}

export interface Organization {
    id: number;
    name_kh: string;
    name_en?: string;
    type: InstituteType;
    code?: string;
    province?: string; // Some parts of the system might use this
    created_at?: string;
    updated_at?: string;
}

export interface OrganizationCreate {
    name_kh: string;
    name_en?: string;
    type: InstituteType;
    code?: string;
    province?: string;
}

export interface OrganizationUpdateBody extends Partial<OrganizationCreate> {
    id: number;
}

export interface OrganizationDeleteBody {
    org_id: number;
}

export interface OrganizationsResponse {
    data: Organization[];
    count: number;
}
