import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectSubmission } from '../services/submissions.service';
import { submissionKeys } from '../services/keys';

export function useRejectSubmission(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => rejectSubmission(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: submissionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}
