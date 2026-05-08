import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

export type DashboardData    = components['schemas']['DashboardData'];
export type StatsResponse    = components['schemas']['StatsResponse'];
export type TopOrganization  = components['schemas']['TopOrganization'];
export type RecentEnrollment = components['schemas']['RecentEnrollment'];
export type GenderDistribution = components['schemas']['GenderDistribution'];

export async function getDashboard(): Promise<DashboardData> {
  const { data, error } = await api.GET('/api/dashboard');
  if (error) throw error;
  return data.data;
}
