/**
 * Dashboard Service
 * 
 * Fetches dashboard statistics and data from the backend
 */

import apiClient from '@/core/api/client';

export interface DashboardStats {
    events: number;
    sports: number;
    participants: number;
    registrations: number;
    organizations: number;
    athletes: number;
    leaders: number;
}

export interface DashboardData {
    stats: DashboardStats;
    genderDistribution: {
        male: number;
        female: number;
        other: number;
    };
    // Add other fields as needed
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}

/**
 * Fetch dashboard data
 */
export async function fetchDashboardData(): Promise<DashboardData | null> {
    try {
        const response = await apiClient.get<DashboardResponse>('/api/v1/dashboard');
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return null;
    }
}
