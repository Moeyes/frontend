import type { EventSportStepValues, PersonalInfoStepValues, DocumentStepValues } from '../services/schema';

export interface RegistrationFormState {
  eventSport:   Partial<EventSportStepValues>;
  personalInfo: Partial<PersonalInfoStepValues>;
  documents:    Partial<DocumentStepValues>;
}

export type RegistrationStep = 'event-sport' | 'personal' | 'documents' | 'review';
