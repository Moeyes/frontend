import { useQuery } from '@tanstack/react-query';
import { getRosterReport, type ReportParams } from '../services/reports.service';
import { reportKeys } from '../services/keys';

export function useRosterReport(params: ReportParams | null) {
  return useQuery({
    queryKey: params ? reportKeys.roster(params.org_id, params.events_id) : ['reports', 'roster', 'disabled'],
    queryFn:  () => getRosterReport(params!),
    enabled:  !!params,
  });
}
