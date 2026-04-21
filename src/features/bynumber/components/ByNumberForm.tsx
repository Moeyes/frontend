'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { StepIndicator } from '@/components/StepIndicator';
import { useByNumberForm } from '../hooks/useByNumber';
import { fetchByNumberData, fetchEventSports, fetchOrgEventSports } from '../services';
import type { Event, Organization, Sport, SportRow } from '../types';
import { ByNumberFormFields } from './ByNumberFormFields';
import { ByNumberSuccess } from './ByNumberSuccess';

type Step = 'event' | 'organization' | 'sports' | 'review';

const FORM_STEPS: readonly Step[] = ['event', 'organization', 'sports', 'review'];

export function ByNumberForm() {
    const [currentStep, setCurrentStep] = useState<Step>('event');
    const [isSuccess, setIsSuccess] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [eventSports, setEventSports] = useState<SportRow[]>([]);
    const [loading, setLoading] = useState(true);

    const { form, onSubmit, isPending, serverError } = useByNumberForm(() => {
        setIsSuccess(true);
    });

    const stepIndex = FORM_STEPS.indexOf(currentStep);
    const progress = ((stepIndex + 1) / FORM_STEPS.length) * 100;

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const { events, organizations } = await fetchByNumberData();
                setEvents(events);
                setOrganizations(organizations);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Load sports when event and organization change
    useEffect(() => {
        const eventId = form.watch('eventId');
        const organizationId = form.watch('organizationId');

        if (eventId && organizationId) {
            const loadSports = async () => {
                try {
                    const sports = await fetchOrgEventSports(organizationId, eventId);
                    form.setValue('sports', sports);
                } catch (error) {
                    console.error('Error loading sports:', error);
                }
            };
            loadSports();
        }
    }, [form.watch('eventId'), form.watch('organizationId')]);

    const handleNext = async () => {
        const currentStepIndex = FORM_STEPS.indexOf(currentStep);
        if (currentStepIndex < FORM_STEPS.length - 1) {
            const fieldsToValidate: (keyof typeof form.getValues)[] = [];

            if (currentStep === 'event') {
                fieldsToValidate.push('eventId');
            } else if (currentStep === 'organization') {
                fieldsToValidate.push('organizationId');
            } else if (currentStep === 'sports') {
                fieldsToValidate.push('sports');
            }

            const isValid = await form.trigger(fieldsToValidate as any);
            if (isValid) {
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
        setCurrentStep('event');
        setEventSports([]);
    };

    if (isSuccess) {
        return <ByNumberSuccess onRegisterAnother={handleRegisterAnother} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Event Participation By Number</h1>
                    <p className="text-slate-600">Register your organization with participant counts</p>
                </div>

                <div className="mb-8">
                    <StepIndicator
                        steps={FORM_STEPS}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
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
                            {currentStep === 'event' && 'Select Event'}
                            {currentStep === 'organization' && 'Select Organization'}
                            {currentStep === 'sports' && 'Enter Participant Counts'}
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
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="min-h-96">
                                    <ByNumberFormFields
                                        form={form}
                                        events={events}
                                        organizations={organizations}
                                        step={currentStep}
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
                                        <Button type="button" onClick={handleNext}>
                                            Next
                                        </Button>
                                    ) : (
                                        <Button type="submit" disabled={isPending} isLoading={isPending}>
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
