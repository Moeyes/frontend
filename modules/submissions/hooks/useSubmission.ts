import { useQuery } from '@tanstack/react-query';
import { getSubmission } from '../services/submissions.service';
import { submissionKeys } from '../services/keys';

export function useSubmission(id: number) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn:  () => getSubmission(id),
    enabled:  !!id,
  });
}
