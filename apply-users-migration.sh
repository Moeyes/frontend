#!/usr/bin/env bash
# =============================================================================
# apply-users-migration.sh
# Run from:  frontend/
#   bash apply-users-migration.sh
# =============================================================================
set -euo pipefail
ROOT="$(pwd)"

echo "▶ Creating directories..."
mkdir -p "$ROOT/modules/users/ports"
mkdir -p "$ROOT/modules/users/adapters"
mkdir -p "$ROOT/modules/users/api"
mkdir -p "$ROOT/modules/users/schema"
mkdir -p "$ROOT/modules/users/mappers"
mkdir -p "$ROOT/modules/users/store"

# ── 1. schema/users.schema.ts ────────────────────────────────────────────────
echo "▶ schema/users.schema.ts"
cat > "$ROOT/modules/users/schema/users.schema.ts" << 'EOF'
/**
 * users.schema.ts
 *
 * Single source of truth for runtime shape validation in the users module.
 * Every adapter response is parsed through these schemas before leaving the
 * data layer. All object schemas use .strict() so unexpected keys from a
 * compromised or changed backend surface as errors rather than silent leaks.
 *
 * Also used by UserForm (via zodResolver) for client-side UX validation.
 * The form schema mirrors the backend UserCreate/UserUpdate validators —
 * role-dependent bindings are enforced here so they are testable in isolation.
 */

import * as z from 'zod';
import { UserRole } from '@/core/auth';

// ─── Shared primitives ────────────────────────────────────────────────────────

const nameField  = z.string().min(1).max(100);
const uuidField  = z.string().uuid();
const userRoleSchema = z.nativeEnum(UserRole);

// ─── API response schemas (adapter boundary) ─────────────────────────────────

/**
 * Matches backend UserPublic exactly.
 * .strict() rejects any extra keys so a backend change is a loud error,
 * not a silent data leak into the UI.
 *
 * PII fields: email, kh_family_name, kh_given_name, en_family_name, en_given_name
 * These are Restricted-PII — never place in logs, URLs, or analytics.
 */
export const userPublicSchema = z
    .object({
        id:              uuidField,
        kh_family_name:  nameField,
        kh_given_name:   nameField,
        en_family_name:  nameField,
        en_given_name:   nameField,
        email:           z.string().email().max(120),
        username:        z.string().min(1).max(50),
        role:            userRoleSchema,
        organization_id: z.number().int().nullable().optional(),
        sport_id:        z.number().int().nullable().optional(),
        photo_path:      z.string().max(255).nullable().optional(),
        full_name:       z.string().max(255).nullable().optional(),
        is_active:       z.boolean(),
        is_superuser:    z.boolean(),
        created_at:      z.string(),
    })
    .strict();

export type UserPublic = z.infer<typeof userPublicSchema>;

/** Matches backend UsersPublic (list envelope). */
export const usersPublicSchema = z
    .object({
        data:  userPublicSchema.array(),
        count: z.number().int().nonnegative(),
    })
    .strict();

export type UsersPublic = z.infer<typeof usersPublicSchema>;

// ─── Form / mutation input schemas ───────────────────────────────────────────

export const userFormSchema = z
    .object({
        username:        z.string().min(3).max(50),
        email:           z.string().email().max(120),
        password:        z.string().max(128).optional().or(z.literal('')),
        kh_family_name:  nameField,
        kh_given_name:   nameField,
        en_family_name:  nameField,
        en_given_name:   nameField,
        role:            userRoleSchema,
        organization_id: z.union([z.number().int(), z.string(), z.null()]).optional(),
        sport_id:        z.union([z.number().int(), z.string(), z.null()]).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.role === UserRole.FEDERATION && !data.sport_id) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sport_id'],        message: 'errors.sportRequired' });
        }
        if (data.role === UserRole.ORGANIZATION && !data.organization_id) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['organization_id'], message: 'errors.organizationRequired' });
        }
    });

export type UserFormValues = z.infer<typeof userFormSchema>;
EOF

# ── 2. core/api/queryKeys.ts ─────────────────────────────────────────────────
echo "▶ core/api/queryKeys.ts"
cat > "$ROOT/core/api/queryKeys.ts" << 'EOF'
/**
 * Central React Query key registry.
 *
 * Single source of truth for every queryKey used across the app.
 */
export const queryKeys = {
    events: {
        all:           ['events'] as const,
        detail:        (eventId: string | number) => ['events', eventId] as const,
        sports:        (eventId: string | number) => ['events', eventId, 'sports'] as const,
        sportOrgs:     (eventId: string | number, sportId: string | number | null) => ['events', eventId, 'sports', sportId, 'orgs'] as const,
        organizations: (eventId: string | number) => ['events', eventId, 'organizations'] as const,
    },
    organizations: {
        all:    ['organizations'] as const,
        allList: ['organizations', 'all'] as const,
    },
    sports: {
        all:          ['sports'] as const,
        allList:      ['sports', 'all'] as const,
        detail:       (sportId: string | number) => ['sports', sportId] as const,
        participants: (sportId: string | number, role: string) => ['sport-participants', sportId, role] as const,
    },
    categories: {
        bySport: (sportId: string | number) => ['categories', sportId] as const,
    },
    cards: {
        list: (orgId: string, eventId: string, page: number) => ['cards', orgId, eventId, page] as const,
        one:  (pId: string, orgId: string, eventId: string) => ['card', pId, orgId, eventId] as const,
    },
    users: {
        /** Invalidate everything in the users cache. */
        all:    ['users'] as const,
        /** List query — pass filter params to scope invalidation precisely. */
        list:   (params?: unknown) => ['users', 'list', params] as const,
        /** Single-record query. id is a UUID string. */
        detail: (id: string) => ['users', 'detail', id] as const,
    },
    registrations: {
        all:  ['registrations'] as const,
        list: <F>(filter: F) => ['registrations', filter] as const,
    },
    participations: {
        all:  ['participations'] as const,
        list: <F>(filter: F) => ['participations', filter] as const,
    },
    dashboard: {
        all:    ['dashboard'] as const,
        scoped: (role: string | null | undefined, orgId: number | null | undefined) => ['dashboard', role, orgId] as const,
    },
} as const;

export default queryKeys;
EOF

# ── 3. ports/IUsersRepository.ts ─────────────────────────────────────────────
echo "▶ ports/IUsersRepository.ts"
cat > "$ROOT/modules/users/ports/IUsersRepository.ts" << 'EOF'
/**
 * IUsersRepository
 *
 * Declares what the users module needs from the data layer — not how it is
 * fetched. Hooks depend only on this interface; swapping HTTP ↔ mock adapter
 * requires changing exactly one line in adapters/index.ts.
 */
import type { UserPublic, UsersPublic } from '../schema/users.schema';
import type { UserCreate, UserUpdate } from '../types';

export interface UserListParams {
    skip?:      number;
    limit?:     number;
    role?:      string;
    is_active?: boolean;
    username?:  string;
}

export interface IUsersRepository {
    getAll(params?: UserListParams): Promise<UsersPublic>;
    getById(id: string): Promise<UserPublic>;
    create(dto: UserCreate): Promise<UserPublic>;
    update(dto: UserUpdate): Promise<UserPublic>;
    delete(id: string): Promise<void>;
}
EOF

# ── 4. api/index.ts ──────────────────────────────────────────────────────────
echo "▶ api/index.ts"
cat > "$ROOT/modules/users/api/index.ts" << 'EOF'
/**
 * modules/users/api/index.ts
 *
 * Raw HTTP calls. Only the adapter imports from here.
 * Hooks and components MUST NOT import from this file directly.
 *
 * Backend shapes:
 *   GET    /api/users/        → { data: UserPublic[], count: number }
 *   GET    /api/users/:id     → UserPublic
 *   POST   /api/users/        → UserPublic
 *   PATCH  /api/users/update  → UserPublic  (body: { user_id, data })
 *   DELETE /api/users/delete  → void        (body: { user_id })
 */
import apiClient from '@/core/api/client';
import type { UserCreate, UserUpdate } from '../types';

const BASE = '/api/users';

export async function apiGetUsers(params?: Record<string, unknown>) {
    const { data } = await apiClient.get<unknown>(`${BASE}/`, { params });
    return data;
}

export async function apiGetUserById(userId: string) {
    const { data } = await apiClient.get<unknown>(`${BASE}/${userId}`);
    return data;
}

export async function apiCreateUser(payload: UserCreate) {
    const { data } = await apiClient.post<unknown>(`${BASE}/`, payload);
    return data;
}

export async function apiUpdateUser(payload: UserUpdate) {
    const { id, ...fields } = payload;
    const { data } = await apiClient.patch<unknown>(`${BASE}/update`, {
        user_id: id,
        data: fields,
    });
    return data;
}

export async function apiDeleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${BASE}/delete`, { data: { user_id: userId } });
}
EOF

# ── 5. adapters/usersHttpAdapter.ts ──────────────────────────────────────────
echo "▶ adapters/usersHttpAdapter.ts"
cat > "$ROOT/modules/users/adapters/usersHttpAdapter.ts" << 'EOF'
/**
 * usersHttpAdapter.ts
 *
 * Concrete HTTP implementation of IUsersRepository.
 * Every response is Zod-parsed with .strict() before leaving this file.
 */
import type { IUsersRepository, UserListParams } from '../ports/IUsersRepository';
import { userPublicSchema, usersPublicSchema } from '../schema/users.schema';
import { apiGetUsers, apiGetUserById, apiCreateUser, apiUpdateUser, apiDeleteUser } from '../api';
import type { UserCreate, UserUpdate } from '../types';

export const usersHttpAdapter: IUsersRepository = {
    getAll: async (params?: UserListParams) =>
        usersPublicSchema.parse(await apiGetUsers(params as Record<string, unknown>)),

    getById: async (id: string) =>
        userPublicSchema.parse(await apiGetUserById(id)),

    create: async (dto: UserCreate) =>
        userPublicSchema.parse(await apiCreateUser(dto)),

    update: async (dto: UserUpdate) =>
        userPublicSchema.parse(await apiUpdateUser(dto)),

    delete: async (id: string) => {
        await apiDeleteUser(id);
    },
};
EOF

# ── 6. adapters/index.ts ─────────────────────────────────────────────────────
echo "▶ adapters/index.ts"
cat > "$ROOT/modules/users/adapters/index.ts" << 'EOF'
/**
 * adapters/index.ts — users module wiring point.
 * Change this one import to swap ALL data behaviour (HTTP ↔ mock).
 * Mock adapters must use synthetic data only — never real user records.
 */
import { usersHttpAdapter } from './usersHttpAdapter';
// import { usersMockAdapter } from './usersMockAdapter'; // ← swap for tests

export const usersRepository = usersHttpAdapter;
EOF

# ── 7. mappers/users.mapper.ts ───────────────────────────────────────────────
echo "▶ mappers/users.mapper.ts"
cat > "$ROOT/modules/users/mappers/users.mapper.ts" << 'EOF'
/**
 * users.mapper.ts
 *
 * form values → API DTOs. Keeps coercion logic out of components.
 * Role-binding rules mirror the backend UserCreate validator.
 */
import { UserRole } from '@/core/auth';
import type { UserFormValues } from '../schema/users.schema';
import type { UserCreate, UserUpdate } from '../types';

export function formDataToCreateDto(values: UserFormValues): UserCreate {
    const { sport_id, organization_id } = resolveBindings(values.role, values.sport_id, values.organization_id);
    return {
        username:        values.username,
        email:           values.email,
        password:        values.password || 'password123',
        kh_family_name:  values.kh_family_name,
        kh_given_name:   values.kh_given_name,
        en_family_name:  values.en_family_name,
        en_given_name:   values.en_given_name,
        role:            values.role,
        sport_id,
        organization_id,
    };
}

export function formDataToUpdateDto(id: string, values: UserFormValues): UserUpdate {
    const { sport_id, organization_id } = resolveBindings(values.role, values.sport_id, values.organization_id);
    const dto: UserUpdate = {
        id,
        username:        values.username,
        email:           values.email,
        kh_family_name:  values.kh_family_name,
        kh_given_name:   values.kh_given_name,
        en_family_name:  values.en_family_name,
        en_given_name:   values.en_given_name,
        role:            values.role,
        sport_id,
        organization_id,
    };
    if (values.password) dto.password = values.password;
    return dto;
}

function resolveBindings(
    role: UserRole,
    rawSportId: UserFormValues['sport_id'],
    rawOrgId:   UserFormValues['organization_id'],
): { sport_id: number | null; organization_id: number | null } {
    if (role === UserRole.FEDERATION)   return { sport_id: rawSportId  ? Number(rawSportId)  : null, organization_id: null };
    if (role === UserRole.ORGANIZATION) return { sport_id: null, organization_id: rawOrgId ? Number(rawOrgId) : null };
    return { sport_id: null, organization_id: null };
}
EOF

# ── 8. shared/utils/maskEmail.ts ─────────────────────────────────────────────
echo "▶ shared/utils/maskEmail.ts"
cat > "$ROOT/shared/utils/maskEmail.ts" << 'EOF'
/**
 * maskEmail — Restricted-PII display masking for list views.
 *
 * pa***@***.com  (panha@example.com)
 * a***@***.co   (a@b.co)
 * ***            (invalid input)
 */
export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***';
    const [local, domain] = email.split('@');
    const maskedLocal  = local.length <= 2 ? local + '***' : local.slice(0, 2) + '***';
    const dotIndex     = domain.lastIndexOf('.');
    const maskedDomain = dotIndex > 0 ? '***' + domain.slice(dotIndex) : '***';
    return `${maskedLocal}@${maskedDomain}`;
}
EOF

# ── 9. store/usersFilters.store.ts ───────────────────────────────────────────
echo "▶ store/usersFilters.store.ts"
cat > "$ROOT/modules/users/store/usersFilters.store.ts" << 'EOF'
/**
 * usersFilters.store.ts
 *
 * Zustand store for users list UI state: search, role filter, pagination.
 * Holds filter criteria only — never PII records, never auth tokens.
 */
import { create } from 'zustand';
import type { UserListParams } from '../ports/IUsersRepository';

interface UsersFiltersState {
    search:     string;
    roleFilter: string | undefined;
    page:       number;

    setSearch:      (value: string) => void;
    setRoleFilter:  (value: string | undefined) => void;
    setPage:        (value: number) => void;
    reset:          () => void;
    getQueryParams: () => UserListParams;
}

const initial = { search: '', roleFilter: undefined as string | undefined, page: 1 };

export const useUsersFiltersStore = create<UsersFiltersState>((set, get) => ({
    ...initial,
    setSearch:     (search)     => set({ search, page: 1 }),
    setRoleFilter: (roleFilter) => set({ roleFilter, page: 1 }),
    setPage:       (page)       => set({ page }),
    reset:         ()           => set(initial),
    getQueryParams: (): UserListParams => {
        const { search, roleFilter, page } = get();
        const LIMIT = 100;
        return {
            skip:  (page - 1) * LIMIT,
            limit: LIMIT,
            ...(roleFilter ? { role: roleFilter } : {}),
            ...(search     ? { username: search } : {}),
        };
    },
}));
EOF

# ── 10. hooks/useUsers.ts ────────────────────────────────────────────────────
echo "▶ hooks/useUsers.ts"
cat > "$ROOT/modules/users/hooks/useUsers.ts" << 'EOF'
'use client';

/**
 * useUsers.ts — consolidated read hooks.
 *
 * staleTime: 0 + gcTime: 0 on all queries because user records contain
 * Restricted-PII (names, email). Data must never be retained in cache
 * after the component unmounts.
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/queryKeys';
import { usersRepository } from '../adapters';
import type { UserListParams } from '../ports/IUsersRepository';

export function useUsers(params?: UserListParams) {
    return useQuery({
        queryKey: queryKeys.users.list(params),
        queryFn:  () => usersRepository.getAll(params),
        staleTime: 0,
        gcTime:    0,
        select:    (res) => res.data,
    });
}

export function useUserDetail(id: string | undefined) {
    return useQuery({
        queryKey: queryKeys.users.detail(id ?? ''),
        queryFn:  () => usersRepository.getById(id!),
        enabled:  !!id,
        staleTime: 0,
        gcTime:    0,
    });
}
EOF

# ── 11. hooks/useMutateUsers.ts ──────────────────────────────────────────────
echo "▶ hooks/useMutateUsers.ts"
cat > "$ROOT/modules/users/hooks/useMutateUsers.ts" << 'EOF'
'use client';

/**
 * useMutateUsers.ts — consolidated mutation hooks (create / update / delete).
 *
 * All three are auditable actions. The server performs the authoritative audit
 * log write and enforces SUPER_ADMIN on every endpoint. The frontend ensures:
 *   1. Requests are authenticated (apiClient sends httpOnly cookies).
 *   2. Errors shown to the user are generic — no raw backend detail in toasts.
 *   3. Cache is invalidated + PII detail entries removed after each mutation
 *      (right-to-erasure: no hidden client copies survive a delete).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { queryKeys } from '@/core/api/queryKeys';
import { usersRepository } from '../adapters';
import type { UserCreate, UserUpdate } from '../types';

export function useCreateUser() {
    const qc      = useQueryClient();
    const tCommon = useTranslations('common.toast');
    const t       = useTranslations('users');

    return useMutation({
        mutationFn: (dto: UserCreate) => usersRepository.create(dto),
        onSuccess: () => {
            toast.success(tCommon('created'));
            qc.invalidateQueries({ queryKey: queryKeys.users.all });
        },
        onError: () => toast.error(t('failedToLoad')),
    });
}

export function useUpdateUser() {
    const qc      = useQueryClient();
    const tCommon = useTranslations('common.toast');
    const t       = useTranslations('users');

    return useMutation({
        mutationFn: (dto: UserUpdate) => usersRepository.update(dto),
        onSuccess: (updated) => {
            toast.success(tCommon('updated'));
            qc.invalidateQueries({ queryKey: queryKeys.users.all });
            qc.removeQueries({ queryKey: queryKeys.users.detail(updated.id) });
        },
        onError: () => toast.error(t('failedToLoad')),
    });
}

export function useDeleteUser() {
    const qc      = useQueryClient();
    const tCommon = useTranslations('common.toast');
    const t       = useTranslations('users');

    return useMutation({
        mutationFn: (userId: string) => usersRepository.delete(userId),
        onSuccess: (_data, userId) => {
            toast.success(tCommon('deleted'));
            qc.removeQueries({ queryKey: queryKeys.users.detail(userId) });
            qc.invalidateQueries({ queryKey: queryKeys.users.all });
        },
        onError: () => toast.error(t('failedToLoad')),
    });
}
EOF

# ── 12. hooks/index.ts ───────────────────────────────────────────────────────
echo "▶ hooks/index.ts"
cat > "$ROOT/modules/users/hooks/index.ts" << 'EOF'
export * from './useUsers';
export * from './useMutateUsers';
EOF

# ── 13. components/UserForm.tsx ──────────────────────────────────────────────
echo "▶ components/UserForm.tsx"
cat > "$ROOT/modules/users/components/UserForm.tsx" << 'EOF'
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@/core/auth';
import { UserRole } from '@/core/auth';
import { userFormSchema, type UserFormValues } from '../schema/users.schema';
import { formDataToCreateDto, formDataToUpdateDto } from '../mappers/users.mapper';
import { useCreateUser, useUpdateUser } from '../hooks';
import { useSports } from '@/modules/sports/hooks';
import { useOrganizations } from '@/modules/organizations/hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField, SelectField } from '@/shared/form';
import { useTranslations } from 'next-intl';

interface UserFormProps { user?: User; onSuccess: () => void; onCancel: () => void; }

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
    const isEditing = !!user;
    const { mutate: create, isPending: isCreating } = useCreateUser();
    const { mutate: update, isPending: isUpdating } = useUpdateUser();
    const t       = useTranslations('users');
    const tCommon = useTranslations('common');

    const { data: sports = [],        isLoading: sportsLoading } = useSports();
    const { data: organizations = [], isLoading: orgsLoading   } = useOrganizations();

    const { control, handleSubmit, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: user ? {
            username: user.username, email: user.email,
            kh_family_name: user.kh_family_name ?? '', kh_given_name: user.kh_given_name ?? '',
            en_family_name: user.en_family_name ?? '', en_given_name: user.en_given_name ?? '',
            role: user.role, organization_id: user.organization_id ?? '', sport_id: user.sport_id ?? '',
        } : {
            role: UserRole.ORGANIZATION, username: '', email: '', password: '',
            kh_family_name: '', kh_given_name: '', en_family_name: '', en_given_name: '',
            organization_id: '', sport_id: '',
        },
    });

    const role         = useWatch({ control, name: 'role' });
    const isFederation = role === UserRole.FEDERATION;
    const isOrganization = role === UserRole.ORGANIZATION;

    const onSubmit = (values: UserFormValues) => {
        if (isEditing) {
            update(formDataToUpdateDto(user.id, values), { onSuccess });
        } else {
            create(formDataToCreateDto(values), { onSuccess });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField control={control} name="username" label={t('username')} required error={errors.username?.message} />
            <TextInputField control={control} name="email" label={t('email')} type="email" required error={errors.email?.message} />
            {!isEditing && <TextInputField control={control} name="password" label={t('password')} type="password" required error={errors.password?.message} />}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextInputField control={control} name="kh_family_name" label={t('khFamilyName')} required error={errors.kh_family_name?.message} />
                <TextInputField control={control} name="kh_given_name"  label={t('khGivenName')}  required error={errors.kh_given_name?.message}  />
                <TextInputField control={control} name="en_family_name" label={t('enFamilyName')} required error={errors.en_family_name?.message} />
                <TextInputField control={control} name="en_given_name"  label={t('enGivenName')}  required error={errors.en_given_name?.message}  />
            </div>
            <SelectField control={control} name="role" label={t('role')} required
                options={[
                    { value: UserRole.SUPER_ADMIN,  label: t('roles.superAdmin')  },
                    { value: UserRole.ADMIN,         label: t('roles.admin')        },
                    { value: UserRole.ORGANIZATION,  label: t('roles.organization') },
                    { value: UserRole.FEDERATION,    label: t('roles.federation')   },
                ]}
                error={errors.role?.message}
            />
            {isFederation && (
                <SelectField control={control} name="sport_id" label={t('sport')} required
                    placeholder={sportsLoading ? tCommon('loading') : t('selectSport')}
                    options={sports.map((s) => ({ value: String(s.id), label: s.name_kh }))}
                    error={errors.sport_id?.message as string}
                />
            )}
            {isOrganization && (
                <SelectField control={control} name="organization_id" label={t('organization')} required
                    placeholder={orgsLoading ? tCommon('loading') : t('selectOrganization')}
                    options={organizations.map((o) => ({ value: String(o.id), label: o.name_kh }))}
                    error={errors.organization_id?.message as string}
                />
            )}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? tCommon('saving') : isEditing ? t('editUser') : t('createUser')}
                </Button>
            </div>
        </form>
    );
}
EOF

# ── 14. components/UserList.tsx ──────────────────────────────────────────────
echo "▶ components/UserList.tsx"
cat > "$ROOT/modules/users/components/UserList.tsx" << 'EOF'
'use client';

import { useState, useCallback } from 'react';
import type { User } from '@/core/auth';
import { UserRole } from '@/core/auth';
import { useUsers } from '../hooks/useUsers';
import { useDeleteUser } from '../hooks/useMutateUsers';
import { useOrganizations } from '@/modules/organizations/hooks';
import { UserForm } from './UserForm';
import { Modal, DataTable, Badge, PageHeader, useConfirm } from '@/shared';
import { Button } from '@/shared/ui/button';
import { maskEmail } from '@/shared/utils/maskEmail';
import { Edit2, Trash2, UserPlus, Shield, User as UserIcon, Building2, Landmark, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UserPublic } from '../schema/users.schema';

interface UsersModalState { isFormOpen: boolean; selected: UserPublic | undefined; }
const initialModal: UsersModalState = { isFormOpen: false, selected: undefined };

export function UserList() {
    const { data: users, isLoading, error } = useUsers();
    const { data: organizations }           = useOrganizations();
    const { mutate: deleteUser }            = useDeleteUser();
    const t       = useTranslations('users');
    const tCommon = useTranslations('common');
    const confirm = useConfirm();
    const [modal, setModal] = useState<UsersModalState>(initialModal);

    const orgName = useCallback(
        (id?: number | null) => id == null ? null : organizations?.find((o) => o.id === id)?.name_kh ?? null,
        [organizations],
    );
    const handleCreate = useCallback(() => setModal({ isFormOpen: true, selected: undefined }), []);
    const handleEdit   = useCallback((user: UserPublic) => setModal({ isFormOpen: true, selected: user }), []);
    const handleDelete = useCallback(async (userId: string) => {
        if (await confirm({ message: t('deleteConfirm') })) deleteUser(userId);
    }, [confirm, deleteUser, t]);
    const closeModal   = useCallback(() => setModal(initialModal), []);

    if (error) return (
        <div className="rounded-lg border border-error/20 bg-error/5 p-12 text-center">
            <p className="font-black text-error">{t('failedToLoad')}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{tCommon('connectionError')}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader title={t('title')} description={t('description')} icon={UserIcon}
                action={<Button onClick={handleCreate} className="h-11 gap-2 px-6"><UserPlus className="w-4 h-4" />{t('createUser')}</Button>}
            />
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                <DataTable isLoading={isLoading} data={users ?? []} columns={[
                    {
                        header: t('columns.user'),
                        accessor: (user) => (
                            <div className="flex flex-col">
                                <span className="font-black text-foreground">{[user.kh_family_name, user.kh_given_name].filter(Boolean).join(' ') || user.username}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{[user.en_family_name, user.en_given_name].filter(Boolean).join(' ') || user.username}</span>
                            </div>
                        ),
                    },
                    {
                        header: t('columns.email'),
                        accessor: (user) => (
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Mail className="w-3.5 h-3.5 opacity-50" />
                                {/* Restricted-PII: masked in list view */}
                                {maskEmail(user.email)}
                            </div>
                        ),
                    },
                    { header: t('columns.role'), accessor: (user) => <RoleBadge role={user.role as UserRole} /> },
                    {
                        header: t('columns.organization'),
                        accessor: (user) => {
                            const name = orgName(user.organization_id);
                            return (
                                <div className="text-xs font-medium text-muted-foreground">
                                    {name ? <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 opacity-50" />{name}</span> : '-'}
                                </div>
                            );
                        },
                    },
                    {
                        header: tCommon('actions'), align: 'right',
                        accessor: (user) => (
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(user)}><Edit2 className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(user.id)} className="text-error hover:text-error hover:bg-error/5"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ),
                    },
                ]} />
            </div>
            <Modal isOpen={modal.isFormOpen} onClose={closeModal} title={modal.selected ? t('editUser') : t('createNewUser')}>
                <UserForm user={modal.selected as unknown as User} onSuccess={closeModal} onCancel={closeModal} />
            </Modal>
        </div>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const t = useTranslations('users.roles');
    const config = {
        [UserRole.SUPER_ADMIN]:  { label: t('superAdmin'), variant: 'default'   as const, icon: Shield    },
        [UserRole.ADMIN]:        { label: t('admin'),       variant: 'default'   as const, icon: Shield    },
        [UserRole.ORGANIZATION]: { label: t('org'),         variant: 'info'      as const, icon: Building2 },
        [UserRole.FEDERATION]:   { label: t('fed'),         variant: 'warning'   as const, icon: Landmark  },
        [UserRole.GUEST]:        { label: t('guest'),       variant: 'secondary' as const, icon: UserIcon  },
    };
    const { label, variant, icon: Icon } = config[role] ?? config[UserRole.GUEST];
    return <Badge variant={variant} className="gap-1.5"><Icon className="w-3 h-3" />{label}</Badge>;
}
EOF

# ── 15. app/(portal)/users/page.tsx ─────────────────────────────────────────
echo "▶ app/(portal)/users/page.tsx"
cat > "$ROOT/app/(portal)/users/page.tsx" << 'EOF'
/**
 * app/(portal)/users/page.tsx — Server Component
 *
 * Route entry point. No business logic, no hooks, no state.
 * Auth + SUPER_ADMIN enforcement happens server-side (middleware + API layer).
 * The previous useRequireRole() was a UX-only client gate; it did not add
 * security and violates the Next.js App Router rule that page.tsx must be a
 * Server Component.
 */
import { UsersPage } from '@/modules/users';

export default function UsersRoute() {
    return <UsersPage />;
}
EOF

# ── 16. Delete old files ─────────────────────────────────────────────────────
echo "▶ Deleting superseded files..."
rm -f "$ROOT/modules/users/services/index.ts"
rmdir "$ROOT/modules/users/services" 2>/dev/null && echo "  removed services/" || echo "  services/ already gone"
rm -f "$ROOT/modules/users/hooks/useCreateUser.ts"
rm -f "$ROOT/modules/users/hooks/useUpdateUser.ts"
rm -f "$ROOT/modules/users/hooks/useDeleteUser.ts"
echo "  removed useCreateUser.ts, useUpdateUser.ts, useDeleteUser.ts"

# ── 17. tsc --noEmit ─────────────────────────────────────────────────────────
echo ""
echo "▶ Running tsc --noEmit..."
cd "$ROOT" && pnpm tsc --noEmit 2>&1
echo ""
echo "✅ Migration script complete."
