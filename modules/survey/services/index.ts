import { surveyHttpAdapter } from '../adapters/surveyHttpAdapter';

export const fetchEvents = surveyHttpAdapter.fetchEvents.bind(surveyHttpAdapter);
export const fetchAllSports = surveyHttpAdapter.fetchAllSports.bind(surveyHttpAdapter);
export const fetchAllOrganizations = surveyHttpAdapter.fetchAllOrganizations.bind(surveyHttpAdapter);
export const fetchEventSports = surveyHttpAdapter.fetchEventSports.bind(surveyHttpAdapter);
export const fetchSurveyData = surveyHttpAdapter.fetchSurveyData.bind(surveyHttpAdapter);
export const submitSurvey = surveyHttpAdapter.submitSurvey.bind(surveyHttpAdapter);
export const clearCache = surveyHttpAdapter.clearCache.bind(surveyHttpAdapter);

export type { SurveySubmissionPayload } from '../schema/survey.schema';
