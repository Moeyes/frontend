import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveSubmission } from '../services/submissions.service';
import { submissionKeys } from '../services/keys';

export function useApproveSubmission(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => approveSubmission(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: submissionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}
