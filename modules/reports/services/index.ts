import { reportsHttpAdapter } from '../adapters/reportsHttpAdapter';

export const downloadOrgSportReport = reportsHttpAdapter.downloadOrgSportReport.bind(reportsHttpAdapter);
export const downloadOrgSportParticipantReport = reportsHttpAdapter.downloadOrgSportParticipantReport.bind(reportsHttpAdapter);
