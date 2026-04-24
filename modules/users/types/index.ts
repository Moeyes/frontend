import type { User } from '@/core/auth';
import { UserRole } from '@/core/auth';

/**
 * User Management Types
 */

export interface UserCreate {
    email: string;
    username: string;
    password?: string;
    role: UserRole;
    org_id?: number | null;
    khmer_name: string;
    english_name: string;
}

export interface UserUpdate extends Partial<UserCreate> {
    id: string;
    is_active?: boolean;
}

export interface UserListResponse {
    users: User[];
    total: number;
}
