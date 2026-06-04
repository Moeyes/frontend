import { participationRepository } from '../adapters';

export const createParticipation   = (payload: Parameters<typeof participationRepository.create>[0]) => participationRepository.create(payload);
export const getParticipations      = (params?: Parameters<typeof participationRepository.getAll>[0]) => participationRepository.getAll(params);
export const getParticipation       = (id: number) => participationRepository.getById(id);
export const updateParticipation    = (id: number, payload: Parameters<typeof participationRepository.update>[1]) => participationRepository.update(id, payload);
export const deleteParticipation    = (id: number) => participationRepository.delete(id);
export const reviewParticipation    = (id: number, payload: Parameters<typeof participationRepository.review>[1]) => participationRepository.review(id, payload);
