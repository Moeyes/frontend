import { useMutation } from '@tanstack/react-query';
import { submitSurvey } from '../services';

export function useSurveyMutation() {
    return useMutation({
        mutationFn: ({
            organizationId,
            eventId,
            sportIds,
        }: {
            organizationId: number;
            eventId: number;
            sportIds: number[];
        }) => submitSurvey(organizationId, eventId, sportIds),
    });
}
