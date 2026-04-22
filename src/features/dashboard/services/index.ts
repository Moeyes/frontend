/**
 * Dashboard Service
 */

import apiClient from '@/lib/api/client';
import { DashboardResponse, DashboardData } from '../types';

/**
 * Fetch dashboard data with role-based filtering
 * GET /api/dashboard
 */
export async function getDashboardData(params?: { orgId?: number; categoryId?: number }): Promise<DashboardData> {
    const response = await apiClient.get<DashboardResponse>('/api/dashboard', {
        params
    });
    
    // In some cases, the backend might return { success: true, data: ... } 
    // or just the data directly. If it's the latter, Axios will put it in response.data.
    // Based on DashboardResponse type:
    if ('success' in response.data && response.data.success) {
        return response.data.data;
    }
    
    return response.data as unknown as DashboardData;
}
