import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flagSubmission } from '../services/submissions.service';
import { submissionKeys } from '../services/keys';

export function useFlagSubmission(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => flagSubmission(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: submissionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}
