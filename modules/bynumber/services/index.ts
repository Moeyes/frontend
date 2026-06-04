import { byNumberHttpAdapter } from '../adapters/bynumberHttpAdapter';

export const fetchEvents = byNumberHttpAdapter.fetchEvents.bind(byNumberHttpAdapter);
export const fetchAllSports = byNumberHttpAdapter.fetchAllSports.bind(byNumberHttpAdapter);
export const fetchAllOrganizations = byNumberHttpAdapter.fetchAllOrganizations.bind(byNumberHttpAdapter);
export const fetchEventSports = byNumberHttpAdapter.fetchEventSports.bind(byNumberHttpAdapter);
export const fetchByNumberData = byNumberHttpAdapter.fetchByNumberData.bind(byNumberHttpAdapter);
export const fetchOrgEventSports = byNumberHttpAdapter.fetchOrgEventSports.bind(byNumberHttpAdapter);
export const submitByNumber = byNumberHttpAdapter.submitByNumber.bind(byNumberHttpAdapter);
export const clearCache = byNumberHttpAdapter.clearCache.bind(byNumberHttpAdapter);

export type { ByNumberSubmissionPayload } from '../schema/bynumber.schema';
