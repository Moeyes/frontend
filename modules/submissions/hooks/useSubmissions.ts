import { useQuery } from '@tanstack/react-query';
import { listSubmissions, type ListSubmissionsParams } from '../services/submissions.service';
import { submissionKeys } from '../services/keys';

export function useSubmissions(params?: ListSubmissionsParams) {
  return useQuery({
    queryKey: submissionKeys.list(params ?? {}),
    queryFn:  () => listSubmissions(params),
  });
}
