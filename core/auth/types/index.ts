export enum UserRole {
    ADMIN        = 'ADMIN',
    ORGANIZATION = 'USER1',
    FEDERATION   = 'USER2',
    GUEST        = 'GUEST',
}

export enum LeaderRole {
    COACH              = 'COACH',
    MANAGER            = 'MANAGER',
    DELEGATE           = 'DELEGATE',
    TEAM_LEAD          = 'TEAM_LEAD',
    COACH_TRAINER      = 'COACH_TRAINER',
    TEACHER_ASSISTANT  = 'TEACHER_ASSISTANT',
}

export interface User {
    id:            string;
    username:      string;
    email:         string;
    khmer_name:    string;
    english_name:  string;
    role:          UserRole;
    is_active:     boolean;
    is_superuser:  boolean;
    photo_path?:   string | null;
    org_id?:       number | null;
    created_at:    string;
    updated_at:    string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthState {
    user:            User | null;
    role:            UserRole | null;
    isAuthenticated: boolean;
    isLoading:       boolean;
    error:           string | null;
    // accessToken and refreshToken removed — now HttpOnly cookies, JS cannot access
}

export interface AuthContextType extends AuthState {
    login:      (username: string, password: string) => Promise<UserRole>;
    logout:     () => Promise<void>;
    refresh:    () => Promise<void>;
    clearError: () => void;
    hasRole:    (role: UserRole | UserRole[]) => boolean;
    canAccess:  (requiredRoles: UserRole[]) => boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: [
        'access:register', 'access:bynumber', 'access:bysport',
        'access:bycategory', 'access:dashboard',
        'action:edit-any-organization', 'action:download-any',
        'action:manage-users', 'action:manage-events',
    ],
    [UserRole.ORGANIZATION]: [
        'access:register', 'access:bynumber', 'access:bysport',
        'access:dashboard', 'action:edit-own-organization', 'action:download-own',
    ],
    [UserRole.FEDERATION]: [
        'access:bycategory', 'access:dashboard', 'action:view-own-sport',
    ],
    [UserRole.GUEST]: ['access:register'],
};

export const FEATURE_ACCESS: Record<string, UserRole[]> = {
    'register':   [UserRole.ADMIN, UserRole.ORGANIZATION, UserRole.GUEST],
    'bynumber':   [UserRole.ADMIN, UserRole.ORGANIZATION],
    'bysport':    [UserRole.ADMIN, UserRole.ORGANIZATION],
    'bycategory': [UserRole.ADMIN, UserRole.FEDERATION],
    'dashboard':  [UserRole.ADMIN, UserRole.ORGANIZATION, UserRole.FEDERATION],
};

export class AuthError extends Error {
    constructor(message: string, public code: string, public statusCode = 401) {
        super(message);
        this.name = 'AuthError';
    }
}

export interface AuthErrorResponse {
    detail: string | AuthErrorDetail[];
}

export interface AuthErrorDetail {
    type:  string;
    loc:   (string | number)[];
    msg:   string;
    input: unknown;
}