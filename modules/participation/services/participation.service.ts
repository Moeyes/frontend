// Organizer registration delegates to the registration-flow module's public API.
// Direct backend calls are not needed here — all endpoints are the same as registration-flow.
// Types and constants are re-exported for use within this module.
export type {
  ParticipantRecord as OrganizerRecord,
  LeaderRole,
  GenderEnum,
} from '@/modules/registration-flow';
export { LEADER_ROLES } from '@/modules/registration-flow';
