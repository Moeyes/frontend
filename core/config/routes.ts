export const ROUTES = {
  login: '/login',
  unauthorized: '/unauthorized',
  dashboard: '/dashboard',

  events: {
    list: '/events',
    new: '/events/new',
    detail: (id: number) => `/events/${id}` as const,
    surveys: (id: number) => `/events/${id}/surveys` as const,
  },

  sports: {
    list: '/sports',
    new: '/sports/new',
    detail: (id: number) => `/sports/${id}` as const,
  },

  organizations: {
    list: '/organizations',
    new: '/organizations/new',
    detail: (id: number) => `/organizations/${id}` as const,
  },

  users: {
    list: '/users',
    new: '/users/new',
    detail: (id: string) => `/users/${id}` as const,
  },

  surveys: {
    home: '/surveys',
    bySport: (eventId: number) => `/surveys/${eventId}/by-sport` as const,
    byNumber: (eventId: number) => `/surveys/${eventId}/by-number` as const,
    byCategory: (eventId: number) => `/surveys/${eventId}/by-category` as const,
  },

  submissions: {
    list: '/submissions',
    detail: (id: number) => `/submissions/${id}` as const,
  },

  register: {
    home: '/register',
    new: '/register/new',
    team: '/register/team',
    detail: (id: number) => `/register/${id}` as const,
  },

  participation: {
    home: '/participation',
    new: '/participation/new',
    detail: (id: number) => `/participation/${id}` as const,
  },

  reports: '/reports',
  cards: '/cards',
} as const;
