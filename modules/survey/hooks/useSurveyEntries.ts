import { useQuery } from '@tanstack/react-query';
import { listSurveyEntries, type ListSurveyParams } from '../services/survey.service';
import { surveyKeys } from '../services/keys';

export function useSurveyEntries(params?: ListSurveyParams) {
  return useQuery({
    queryKey: surveyKeys.list(params ?? {}),
    queryFn:  () => listSurveyEntries({ limit: 200, ...params }),
  });
}
