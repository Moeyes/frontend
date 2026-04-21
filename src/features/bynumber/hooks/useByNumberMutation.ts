import { useMutation } from '@tanstack/react-query';
import { submitByNumber } from '../services';
import type { SportRow } from '../types';

export function useByNumberMutation() {
    return useMutation({
        mutationFn: ({
            organizationId,
            eventId,
            sports,
        }: {
            organizationId: number;
            eventId: number;
            sports: SportRow[];
        }) => submitByNumber(organizationId, eventId, sports),
    });
}
