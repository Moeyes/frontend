/**
 * Reports Service
 */

import apiClient from '@/lib/api/client';

/**
 * Download Org-Sport Excel Report
 * GET /api/excel/org-sport
 */
export async function downloadOrgSportReport(params: { event_id: number; organization_id?: number }): Promise<Blob> {
    const response = await apiClient.get('/api/excel/org-sport', {
        params,
        responseType: 'blob'
    });
    return response.data;
}

/**
 * Download Org-Sport-Participant Excel Report
 * GET /api/excel/org-sport-participant
 */
export async function downloadOrgSportParticipantReport(params: { event_id: number; organization_id?: number }): Promise<Blob> {
    const response = await apiClient.get('/api/excel/org-sport-participant', {
        params,
        responseType: 'blob'
    });
    return response.data;
}
