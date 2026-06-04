'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { sportsRepository } from '../adapters';
import type { ParticipantRole } from '../types';

export function useSports() {
    return useQuery({
        queryKey: queryKeys.sports.all,
        queryFn:  () => sportsRepository.getAll(),
        select:   (res) => res.data,
    });
}

export function useSportDetail(sportId: number) {
    return useQuery({
        queryKey: queryKeys.sports.detail(sportId),
        queryFn:  () => sportsRepository.getById(sportId),
        enabled:  !!sportId,
    });
}

export function useCategories(sportId: number) {
    return useQuery({
        queryKey: queryKeys.categories.bySport(sportId),
        queryFn:  () => sportsRepository.getCategoriesBySportId(sportId),
        enabled:  !!sportId,
        select:   (res) => res.data,
    });
}

export function useSportParticipants(
    sportId: number,
    role: ParticipantRole,
    enabled = true,
) {
    return useQuery({
        queryKey: queryKeys.sports.participants(sportId, role),
        queryFn:  () => sportsRepository.getParticipants({ role, sportId }),
        enabled:  enabled && !!sportId,
        staleTime: 30_000,
        select:   (res) => res.data,
    });
}
