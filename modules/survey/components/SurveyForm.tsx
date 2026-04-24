'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { useSurveyForm } from '../hooks/useSurvey';
import { fetchSurveyData, fetchEventSports } from '../services';
import type { Event, Organization, Sport } from '../types';
import { SurveyFormFields } from './SurveyFormFields';
import { SurveySuccess } from './SurveySuccess';

type Step = 'event_type' | 'event' | 'organization' | 'sports' | 'review';

const FORM_STEPS: readonly Step[] = ['event_type', 'event', 'organization', 'sports', 'review'];

const EVENT_TYPES = [
    { id: 'NATIONAL', name_kh: 'កីឡាជាតិ' },
    { id: 'UNIVERSITY', name_kh: 'កីឡាឧត្តមសិក្សា និងមធ្យមសិក្សា​បចេ្ចកទេសថ្នាក់ជាតិថ្នាក់ជាតិ' },
    { id: 'HIGH_SCHOOL', name_kh: 'សិស្សមធ្យមសិក្សា​ថ្នាក់ជាតិ' },
    { id: 'PRIMARY_SCHOOL', name_kh: 'កីឡាសិស្សបថមសិក្សាជាតិ' },
];

export function SurveyForm() {
  const [currentStep, setCurrentStep] = useState<Step>('event_type');
  const [isSuccess, setIsSuccess] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [eventSports, setEventSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  const { form, onSubmit, isPending, serverError } = useSurveyForm(() => {
    setIsSuccess(true);
  });

  const stepIndex = FORM_STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / FORM_STEPS.length) * 100;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { events, organizations } = await fetchSurveyData();
        console.log('Fetched Events:', events.map(e => ({ id: e.id, type: e.type })));
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
    ? events.filter(e => {
        const eventTypeFromApi = String(e.type).trim();
        const selectedType = String(selectedEventType).trim();
        
        // Match by Enum Name (e.g. 'NATIONAL')
        if (eventTypeFromApi === selectedType) return true;
        
        // Match by Khmer Value
        const khValue = EVENT_TYPES.find(t => t.id === selectedType)?.name_kh;
        if (khValue && eventTypeFromApi === khValue.trim()) return true;
        
        return false;
    })
    : [];

  const watchedEventId = form.watch('eventId');
  // const watchedOrgId = form.watch('organizationId');

  // Load sports when event changes
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!watchedEventId) {
        // Defer to microtask to avoid synchronous setState warning
        await Promise.resolve();
        if (isMounted) {
          setEventSports(prev => (prev.length > 0 ? [] : prev));
        }
        return;
      }

      try {
        const sports = await fetchEventSports(watchedEventId);
        if (isMounted) {
          setEventSports(sports);
        }
      } catch (error) {
        console.error('Failed to load sports:', error);
      }
    };
    
    load();
    return () => { isMounted = false; };
  }, [watchedEventId]);

  const handleNext = async () => {
    const currentStepIndex = FORM_STEPS.indexOf(currentStep);
    if (currentStepIndex < FORM_STEPS.length - 1) {
      let canProceed = true;

      if (currentStep === 'event_type') {
          if (!selectedEventType) canProceed = false;
      } else if (currentStep === 'event') {
          canProceed = await form.trigger('eventId');
      } else if (currentStep === 'organization') {
          canProceed = await form.trigger('organizationId');
      } else if (currentStep === 'sports') {
          canProceed = await form.trigger('sportIds');
      }

      if (canProceed) {
        setCurrentStep(FORM_STEPS[currentStepIndex + 1]);
      }
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
    setEventSports([]);
  };

  if (isSuccess) {
    return <SurveySuccess onRegisterAnother={handleRegisterAnother} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Event Registration Survey</h1>
          <p className="text-slate-600">Register your organization for event participation</p>
        </div>

        <div className="mb-8">
          <StepIndicator
            steps={FORM_STEPS.map(s => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}
            currentStep={currentStep.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            onStepClick={(stepStr) => {
                const stepKey = stepStr.toLowerCase().replace(/ /g, '_') as Step;
                handleStepClick(stepKey);
            }}
          />
          <div className="mt-4 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 'event_type' && 'Select Event Category'}
              {currentStep === 'event' && 'Select Event'}
              {currentStep === 'organization' && 'Select Organization'}
              {currentStep === 'sports' && 'Select Sports'}
              {currentStep === 'review' && 'Review Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serverError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {serverError}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit, (err) => console.log('❌ Form Validation Errors:', err))}>
                <div className="min-h-96">
                  <SurveyFormFields
                    form={form}
                    events={filteredEvents}
                    organizations={organizations}
                    eventSports={eventSports}
                    step={currentStep}
                    eventTypes={EVENT_TYPES}
                    selectedEventType={selectedEventType}
                    onSelectEventType={setSelectedEventType}
                  />
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    onClick={handlePreviousStep}
                    variant="outline"
                    disabled={stepIndex === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex-1" />
                  {currentStep !== 'review' ? (
                    <Button 
                        type="button" 
                        onClick={handleNext}
                        disabled={currentStep === 'event_type' && !selectedEventType}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isPending}>
                      {isPending ? 'Submitting...' : 'Submit'}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
