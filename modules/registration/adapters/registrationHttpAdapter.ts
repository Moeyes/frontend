import type { IRegistrationRepository } from '../ports/IRegistrationRepository';
import { enrollmentListResponseSchema, enrollmentSchema, registerResponseSchema, revealedPiiSchema } from '../schema/registration.schema';
import {
    apiRegisterParticipant, apiSearchRegistrations, apiGetRegistration,
    apiRevealParticipantPii, apiUpdateRegistration, apiDeleteRegistration,
} from '../api';
import type { RegisterPayload, RegisterResponse, Enrollment, EnrollmentListResponse } from '../types';

export const registrationHttpAdapter: IRegistrationRepository = {
    register: async (payload: RegisterPayload) => {
        const parsed = registerResponseSchema.parse(await apiRegisterParticipant(payload));
        return parsed as unknown as RegisterResponse;
    },
    getAll: async (params) => {
        const parsed = enrollmentListResponseSchema.parse(await apiSearchRegistrations(params));
        return parsed as unknown as EnrollmentListResponse;
    },
    revealPhone: async (enrollId: number) => {
        return revealedPiiSchema.parse(await apiRevealParticipantPii(enrollId));
    },
    getById: async (enrollId: number) => {
        const parsed = enrollmentSchema.parse(await apiGetRegistration(enrollId));
        return parsed as unknown as Enrollment;
    },
    update: async (enrollId: number, payload: Partial<RegisterPayload>) => {
        const parsed = enrollmentSchema.parse(await apiUpdateRegistration(enrollId, payload as Record<string, unknown>));
        return parsed as unknown as Enrollment;
    },
    delete: async (enrollId: number) => {
        const r = await apiDeleteRegistration(enrollId);
        return r as unknown as { message: string };
    },
};
