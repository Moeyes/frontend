import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSurveyEntry, updateSurveyEntry, type SurveyCreate, type SurveyUpdate } from '../services/survey.service';
import { surveyKeys } from '../services/keys';

export function useSubmitSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SurveyCreate) => createSurveyEntry(body),
    onSettled:  () => qc.invalidateQueries({ queryKey: surveyKeys.lists() }),
  });
}

export function useUpdateSurveyEntry(entryId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SurveyUpdate) => updateSurveyEntry(entryId, body),
    onSuccess:  (updated) => qc.setQueryData(surveyKeys.detail(entryId), updated),
    onSettled:  () => qc.invalidateQueries({ queryKey: surveyKeys.lists() }),
  });
}
