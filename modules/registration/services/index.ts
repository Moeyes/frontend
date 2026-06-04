import { registrationRepository } from '../adapters';

export const registerParticipant   = (payload: Parameters<typeof registrationRepository.register>[0]) => registrationRepository.register(payload);
export const getRegistrations      = (params?: Parameters<typeof registrationRepository.getAll>[0]) => registrationRepository.getAll(params);
export const getRegistration       = (enrollId: number) => registrationRepository.getById(enrollId);
export const updateRegistration    = (enrollId: number, payload: Parameters<typeof registrationRepository.update>[1]) => registrationRepository.update(enrollId, payload);
export const deleteRegistration    = (enrollId: number) => registrationRepository.delete(enrollId);
