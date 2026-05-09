import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSportToEvent } from '../services/events.service';
import { eventKeys } from '../services/keys';

interface AddSportPayload { sportId: number; quota?: number | null }

export function useAddSportToEvent(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sportId, quota }: AddSportPayload) =>
      addSportToEvent({ events_id: eventId, sports_id: sportId, quota: quota ?? null }),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: eventKeys.sports(eventId) }),
  });
}
