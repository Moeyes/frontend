import type { IRegistrationRepository } from '../ports/IRegistrationRepository';
import { enrollmentListSchema, enrollmentSchema, registerResponseSchema } from '../schema/registration.schema';
import {
    apiRegisterParticipant, apiGetRegistrations, apiGetRegistration,
    apiUpdateRegistration, apiDeleteRegistration,
} from '../api';
import type { RegisterPayload, RegisterResponse, Enrollment, EnrollmentListResponse } from '../types';

export const registrationHttpAdapter: IRegistrationRepository = {
    register: async (payload: RegisterPayload) => {
        const parsed = registerResponseSchema.parse(await apiRegisterParticipant(payload));
        return parsed as unknown as RegisterResponse;
    },
    getAll: async (params) => {
        const parsed = enrollmentListSchema.parse(await apiGetRegistrations(params));
        return parsed as unknown as EnrollmentListResponse;
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
