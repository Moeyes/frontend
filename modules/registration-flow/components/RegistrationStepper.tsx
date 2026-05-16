'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { PageHeader, BackLink, StepIndicator } from '@/shared/ui';
import { useEffectiveOrgId } from '@/core/auth';
import { ROUTES } from '@/core/config';
import { useCreateRegistration } from '../hooks/useCreateRegistration';
import { EventSportStep }   from './EventSportStep';
import { PersonalInfoStep } from './PersonalInfoStep';
import { DocumentStep }     from './DocumentStep';
import { ReviewStep }       from './ReviewStep';
import type { RegistrationStep, RegistrationFormState } from '../types';
import type { EventSportStepValues, PersonalInfoStepValues, DocumentStepValues } from '../services/schema';


export function RegistrationStepper() {
  const t             = useTranslations('registration');
  const router        = useRouter();
  const organizationId = useEffectiveOrgId();
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

    mutation.mutate({
      kh_family_name:  personalInfo.kh_family_name   ?? '',
      kh_given_name:   personalInfo.kh_given_name    ?? '',
      en_family_name:  personalInfo.en_family_name   ?? '',
      en_given_name:   personalInfo.en_given_name    ?? '',
      gender:          (personalInfo.gender ?? 'MALE') as 'MALE' | 'FEMALE',
      date_of_birth:   personalInfo.date_of_birth    ?? '',
      phone:           personalInfo.phone            ?? undefined,
      address:         personalInfo.address          ?? undefined,
      photoUrl:             documents.photoUrl            ?? undefined,
      birthCertificateUrl:  documents.birthCertificateUrl ?? undefined,
      nationalIdUrl:        documents.nationalIdUrl       ?? undefined,
      passportUrl:          documents.passportUrl         ?? undefined,
      id_document_type: 'OTHER' as const,
      sport_id:        eventSport.sport_id           ?? 0,
      category_id:     eventSport.category_id        ?? null,
      role:            eventSport.role               ?? 'athlete',
      leader_role:     (eventSport.leader_role ?? null) as 'coach' | 'manager' | 'delegate' | 'team_lead' | 'coach_trainer' | 'teacher_assistant' | null | undefined,
      organization_id: organizationId                ?? 0,
      event_id:        eventSport.event_id           ?? null,
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
