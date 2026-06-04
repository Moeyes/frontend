'use client';

import { useState, useEffect } from 'react';
import type { Path } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { useByNumberForm } from '../hooks/useByNumber';
import { bynumberRepository } from '../adapters';
import type { Event, Organization } from '../types';
import { ByNumberFormFields } from './ByNumberFormFields';
import { ByNumberFormNavButtons } from './ByNumberFormNavButtons';
import { ByNumberSuccess } from './ByNumberSuccess';

type Step = 'event_type' | 'event' | 'organization' | 'sports' | 'review';

const FORM_STEPS: readonly Step[] = ['event_type', 'event', 'organization', 'sports', 'review'];

const EVENT_TYPES = [
  { id: 'NATIONAL', name_kh: 'កីឡាជាតិ' },
  { id: 'UNIVERSITY', name_kh: 'កីឡាឧត្តមសិក្សា និងមធ្យមសិក្សា​បចេ្ចកទេសថ្នាក់ជាតិថ្នាក់ជាតិ' },
  { id: 'HIGH_SCHOOL', name_kh: 'សិស្សមធ្យមសិក្សា​ថ្នាក់ជាតិ' },
  { id: 'PRIMARY_SCHOOL', name_kh: 'កីឡាសិស្សបឋមសិក្សាជាតិ' },
];

export function ByNumberForm() {
  const [currentStep, setCurrentStep] = useState<Step>('event_type');
  const [isSuccess, setIsSuccess] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportsLoading, setSportsLoading] = useState(false);
  const t = useTranslations('bynumber');

  const { form, onSubmit, isPending, serverError } = useByNumberForm(() => {
    setIsSuccess(true);
  });

  const stepIndex = FORM_STEPS.indexOf(currentStep);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { events, organizations } = await bynumberRepository.fetchByNumberData();
        setEvents(events);
        setOrganizations(organizations);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtered events based on selected type
  const filteredEvents = selectedEventType
    ? events.filter((e) => {
        const eventTypeFromApi = String(e.type).trim();
        const selectedType = String(selectedEventType).trim();

        // Match by Enum Name (e.g. 'NATIONAL')
        if (eventTypeFromApi === selectedType) return true;

        // Match by Khmer Value
        const khValue = EVENT_TYPES.find((t) => t.id === selectedType)?.name_kh;
        if (khValue && eventTypeFromApi === khValue.trim()) return true;

        return false;
      })
    : [];

  // Extract watched values so the dependency array stays static
  const eventId = form.watch('eventId');
  const organizationId = form.watch('organizationId');

  // Load sports when event and organization are both selected
  useEffect(() => {
    if (!eventId || !organizationId) return;

    const loadSports = async () => {
      setSportsLoading(true);
      try {
        const sports = await bynumberRepository.fetchOrgEventSports(organizationId, eventId);
        form.setValue('sports', sports);
      } catch {
        // Sports failed to load; the section renders empty and reloads on retry.
      } finally {
        setSportsLoading(false);
      }
    };

    loadSports();
  }, [eventId, organizationId, form]);

  const handleNext = async () => {
    const currentStepIndex = FORM_STEPS.indexOf(currentStep);
    if (currentStepIndex >= FORM_STEPS.length - 1) return;

    let canProceed = true;

    if (currentStep === 'event_type') {
      if (!selectedEventType) canProceed = false;
    } else {
      const fieldsToValidate: Path<Parameters<typeof onSubmit>[0]>[] = [];
      if (currentStep === 'event') fieldsToValidate.push('eventId');
      else if (currentStep === 'organization') fieldsToValidate.push('organizationId');
      else if (currentStep === 'sports') fieldsToValidate.push('sports');

      canProceed = await form.trigger(fieldsToValidate);
    }

    if (canProceed) {
      setCurrentStep(FORM_STEPS[currentStepIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const currentStepIndex = FORM_STEPS.indexOf(currentStep);
    if (currentStepIndex > 0) {
      setCurrentStep(FORM_STEPS[currentStepIndex - 1]);
    }
  };

  const handleStepClick = (step: Step) => {
    const clickedStepIndex = FORM_STEPS.indexOf(step);
    if (clickedStepIndex <= stepIndex) {
      setCurrentStep(step);
    }
  };

  const handleRegisterAnother = () => {
    form.reset();
    setIsSuccess(false);
    setCurrentStep('event_type');
    setSelectedEventType(null);
  };

  if (isSuccess) {
    return <ByNumberSuccess onRegisterAnother={handleRegisterAnother} />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold leading-snug text-foreground">{t('title')}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="mb-8">
          <StepIndicator steps={FORM_STEPS.map((s) => t(`steps.${s}`))} currentIndex={stepIndex} onStepClick={(index) => handleStepClick(FORM_STEPS[index])} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t(`headings.${currentStep}`)}</CardTitle>
          </CardHeader>
          <CardContent>
            {serverError && <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm leading-relaxed text-destructive">{serverError}</div>}

            {loading ? (
              <div className="py-12 text-center text-sm leading-relaxed text-muted-foreground">{t('loading')}</div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="min-h-96">
                  {sportsLoading && currentStep === 'sports' ? (
                    <div className="py-12 text-center text-sm leading-relaxed text-muted-foreground">{t('loadingSports')}</div>
                  ) : (
                    <ByNumberFormFields
                      form={form}
                      events={filteredEvents}
                      organizations={organizations}
                      step={currentStep}
                      eventTypes={EVENT_TYPES}
                      selectedEventType={selectedEventType}
                      onSelectEventType={setSelectedEventType}
                    />
                  )}
                </div>

                <ByNumberFormNavButtons
                  stepIndex={stepIndex}
                  currentStep={currentStep}
                  selectedEventType={selectedEventType}
                  isPending={isPending}
                  onPrevious={handlePreviousStep}
                  onNext={handleNext}
                />
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
