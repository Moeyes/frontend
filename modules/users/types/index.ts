// UI-only types for the users module.
export type UserSortField = 'username' | 'email' | 'role' | 'created_at';
export type UserFilterState = {
  search: string;
  role: string | null;
};
