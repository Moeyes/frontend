import { useQuery } from '@tanstack/react-query';
import { getNumbersReport, type ReportParams } from '../services/reports.service';
import { reportKeys } from '../services/keys';

export function useNumbersReport(params: ReportParams | null) {
  return useQuery({
    queryKey: params ? reportKeys.numbers(params.org_id, params.events_id) : ['reports', 'numbers', 'disabled'],
    queryFn:  () => getNumbersReport(params!),
    enabled:  !!params,
  });
}
