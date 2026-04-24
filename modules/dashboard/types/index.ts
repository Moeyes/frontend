/**
 * Dashboard Types
 */

export interface DashboardStats {
    events: number;
    sports: number;
    participants: number;
    registrations: number;
    organizations: number;
    athletes: number;
    leaders: number;
}

export interface GenderDistribution {
    male: number;
    female: number;
    other: number;
}

export interface TopOrganization {
    id: number;
    name_kh: string;
    participant_count: number;
}

export interface RecentEnrollment {
    id: number;
    kh_name: string;
    en_name: string;
    sport_name: string;
    gender: string;
    phone: string;
    createdAt: string;
}

export interface DashboardData {
    stats: DashboardStats;
    genderDistribution: GenderDistribution;
    topOrganizations: TopOrganization[];
    recentEnrollments: RecentEnrollment[];
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}
