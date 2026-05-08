'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { PageHeader, BackLink, StepIndicator } from '@/shared/ui';
import { useAuth } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useCreateRegistration } from '../hooks/useCreateRegistration';
import { EventSportStep }   from './EventSportStep';
import { PersonalInfoStep } from './PersonalInfoStep';
import { DocumentStep }     from './DocumentStep';
import { ReviewStep }       from './ReviewStep';
import type { RegistrationStep, RegistrationFormState } from '../types';
import type { EventSportStepValues, PersonalInfoStepValues, DocumentStepValues } from '../services/schema';

const STEPS: { key: RegistrationStep; label: string }[] = [
  { key: 'event-sport', label: '' },
  { key: 'personal',    label: '' },
  { key: 'documents',   label: '' },
  { key: 'review',      label: '' },
];

export function RegistrationStepper() {
  const t       = useTranslations('registration');
  const { user } = useAuth();
  const router  = useRouter();
  const mutation = useCreateRegistration();

  const steps = [
    { key: 'event-sport', label: t('steps.event') },
    { key: 'personal',    label: t('steps.personal') },
    { key: 'documents',   label: t('steps.documents') },
    { key: 'review',      label: t('steps.review') },
  ];

  const [currentStep, setCurrentStep] = useState<RegistrationStep>('event-sport');
  const [formState, setFormState] = useState<RegistrationFormState>({
    eventSport:   {},
    personalInfo: {},
    documents:    {},
  });

  const handleEventSportNext = (values: EventSportStepValues) => {
    setFormState((s) => ({ ...s, eventSport: values }));
    setCurrentStep('personal');
  };

  const handlePersonalNext = (values: PersonalInfoStepValues) => {
    setFormState((s) => ({ ...s, personalInfo: values }));
    setCurrentStep('documents');
  };

  const handleDocumentsNext = (values: DocumentStepValues) => {
    setFormState((s) => ({ ...s, documents: values }));
    setCurrentStep('review');
  };

  const handleSubmit = () => {
    const { eventSport, personalInfo, documents } = formState;
    const organizationId = user?.organization_id ?? null;

    mutation.mutate({
      ...personalInfo,
      ...documents,
      sport_id:       eventSport.sport_id,
      category_id:    eventSport.category_id ?? null,
      role:           eventSport.role,
      leader_role:    eventSport.leader_role ?? null,
      organization_id: organizationId,
      // event_id not in ParticipantUpdateRequest — backend uses sport+org to resolve event
    }, {
      onSuccess: () => {
        toast.success(t('success.title'));
        router.push(ROUTES.register.home);
      },
      onError: () => {
        toast.error(t('list.failedToLoad'));
      },
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <BackLink href={ROUTES.register.home} label={t('backToList')} />
      <PageHeader title={t('createTitle')} />

      {!user?.organization_id && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          {t('orgIdMissing')}
        </div>
      )}

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="bg-card rounded-xl border p-6">
        {currentStep === 'event-sport' && (
          <EventSportStep
            defaultValues={formState.eventSport as EventSportStepValues}
            onNext={handleEventSportNext}
          />
        )}
        {currentStep === 'personal' && (
          <PersonalInfoStep
            defaultValues={formState.personalInfo as PersonalInfoStepValues}
            onNext={handlePersonalNext}
            onBack={() => setCurrentStep('event-sport')}
          />
        )}
        {currentStep === 'documents' && (
          <DocumentStep
            defaultValues={formState.documents as DocumentStepValues}
            eventId={formState.eventSport.event_id ?? 0}
            dateOfBirth={formState.personalInfo.date_of_birth ?? ''}
            onNext={handleDocumentsNext}
            onBack={() => setCurrentStep('personal')}
          />
        )}
        {currentStep === 'review' && (
          <ReviewStep
            eventSport={formState.eventSport as EventSportStepValues}
            personalInfo={formState.personalInfo as PersonalInfoStepValues}
            documents={formState.documents as DocumentStepValues}
            isPending={mutation.isPending}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep('documents')}
          />
        )}
      </div>
    </div>
  );
}
