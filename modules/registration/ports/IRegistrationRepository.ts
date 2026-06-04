import type {
    RegisterPayload, RegisterResponse,
    Enrollment, EnrollmentListResponse,
} from '../types';

export interface IRegistrationRepository {
    register(payload: RegisterPayload): Promise<RegisterResponse>;
    getAll(params?: {
        skip?: number;
        limit?: number;
        organization_id?: number;
        event_id?: number;
        sport_id?: number;
        search?: string;
    }): Promise<EnrollmentListResponse>;
    getById(enrollId: number): Promise<Enrollment>;
    /** Audited, admin-only reveal of a participant's masked phone (server enforces + logs). */
    revealPhone(enrollId: number): Promise<{ enroll_id: number; phone: string }>;
    update(enrollId: number, payload: Partial<RegisterPayload>): Promise<Enrollment>;
    delete(enrollId: number): Promise<{ message: string }>;
}
