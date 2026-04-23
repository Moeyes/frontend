import { useQuery } from '@tanstack/react-query';
import { getPdfData } from '../services';

export const usePdfData = (sportId: number, orgId: number, eventId: number) => {
  return useQuery({
    queryKey: ['pdf-data', sportId, orgId, eventId],
    queryFn: () => getPdfData(sportId, orgId, eventId),
    enabled: !!sportId && !!orgId && !!eventId,
  });
};
