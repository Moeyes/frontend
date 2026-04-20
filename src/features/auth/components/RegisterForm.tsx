/**
 * RegisterForm Component
 * 
 * Multi-step registration form with advanced UX
 * 10 UX Principles: Status visibility, system-world match, user control,
 * consistency, error prevention, recognition, flexibility, aesthetics,
 * error recovery, help & documentation
 */

'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useRegisterForm } from '@/features/auth/hooks';
import { RegisterFormFields } from './RegisterFormFields';
import { RegistrationSuccess } from './RegistrationSuccess';
import { Button } from '@/components/ui/button';
import {
    loadCascadingData,
    fetchCategories,
    CascadingDataLoaded,
    Category,
} from '@/features/auth/services/registration-data.service';
import { FORM_STEPS, FORM_STEP_LABELS } from '@/config/constants';

type Step = (typeof FORM_STEPS)[number];

/**
 * Registration form component with multi-step support and enhanced UX
 */
export function RegisterForm() {
    const [currentStep, setCurrentStep] = useState<Step>('event');
    const [cascadingData, setCascadingData] = useState<CascadingDataLoaded | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

    const { form, onSubmit, isPending, serverError } = useRegisterForm(
        () => {
            setIsSuccess(true);
        }
    );

    const stepIndex = (FORM_STEPS as readonly Step[]).indexOf(currentStep);
    const progress = ((stepIndex + 1) / FORM_STEPS.length) * 100;

    // Load data on mount
    useEffect(() => {
        async function initialize() {
            setLoading(true);
            const data = await loadCascadingData();
            setCascadingData(data);
            setLoading(false);
        }
        initialize();
    }, []);

    // Load categories when sport and event change
    const sportId = form.watch('sportId') ?? '';
    const eventId = form.watch('eventId') ?? '';

    useEffect(() => {
        if (sportId && eventId) {
            fetchCategories(eventId, sportId).then(setCategories);
        }
    }, [sportId, eventId]);

    const handleNext = async () => {
        const currentStepIndex = (FORM_STEPS as readonly Step[]).indexOf(currentStep);
        if (currentStepIndex < FORM_STEPS.length - 1) {
            // Validate fields for current step before proceeding
            if (currentStep === 'event') {
                const fieldsToValidate = ['eventType', 'eventId', 'organizationId', 'sportId'];
                if (form.getValues('role') === 'Athlete') {
                    fieldsToValidate.push('categoryId');
                }
                const isValid = await form.trigger(fieldsToValidate as Parameters<typeof form.trigger>[0]);
                if (isValid) {
                    setCurrentStep(FORM_STEPS[currentStepIndex + 1]);
                }
            } else if (currentStep === 'personal') {
                const fieldsToValidate = [
                    'khFamilyName', 'khGivenName', 'enFamilyName', 'enGivenName',
                    'gender', 'dateOfBirth', 'phone', 'idDocumentType', 'role'
                ];
                if (form.getValues('role') === 'Leader') {
                    fieldsToValidate.push('leaderRole');
                }
                const isValid = await form.trigger(fieldsToValidate as Parameters<typeof form.trigger>[0]);
                if (isValid) {
                    setCurrentStep(FORM_STEPS[currentStepIndex + 1]);
                }
            } else if (currentStep === 'documents') {
                const isValid = await form.trigger([]);
                if (isValid) {
                    setCurrentStep(FORM_STEPS[currentStepIndex + 1]);
                }
            }
        }
    };

    const handleBack = () => {
        const currentStepIndex = (FORM_STEPS as readonly Step[]).indexOf(currentStep);
        if (currentStepIndex > 0) {
            setCurrentStep(FORM_STEPS[currentStepIndex - 1]);
        }
    };

    const handleStepClick = (step: Step) => {
        const clickedStepIndex = (FORM_STEPS as readonly Step[]).indexOf(step);
        if (clickedStepIndex <= stepIndex) {
            setCurrentStep(step);
        }
    };

    const handleRegisterAnother = () => {
        const eventValues = {
            eventType: form.getValues('eventType'),
            eventId: form.getValues('eventId'),
            organizationId: form.getValues('organizationId'),
            sportId: form.getValues('sportId'),
            categoryId: form.getValues('categoryId'),
        };
        form.reset(eventValues);
        setIsSuccess(false);
        setCurrentStep('personal');
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleSubmit = form.handleSubmit(onSubmit);

    if (isSuccess) {
        return (
            <RegistrationSuccess
                onRegisterAnother={handleRegisterAnother}
                onGoHome={handleGoHome}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading registration form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-bold text-3xl text-foreground mb-3">
                        Sports Event Registration
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Complete all 4 steps to register for your next sports event
                    </p>
                </div>

                {/* Enhanced Stepper with Progress */}
                <div className="mb-10">
                    {/* Step Circles */}
                    <div className="flex justify-between mb-6">
                        {(FORM_STEPS as readonly Step[]).map((step, idx) => (
                            <div key={step} className="flex flex-col items-center flex-1">
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(step)}
                                    disabled={idx > stepIndex}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-all duration-300 ${idx < stepIndex
                                            ? 'bg-success text-white ring-4 ring-success/20'
                                            : idx === stepIndex
                                                ? 'bg-gradient-to-br from-primary to-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-105'
                                                : 'bg-secondary text-muted-foreground cursor-not-allowed'
                                        }`}
                                    title={idx <= stepIndex ? `Go to ${FORM_STEP_LABELS[step]}` : 'Complete previous steps'}
                                >
                                    {idx < stepIndex ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        idx + 1
                                    )}
                                </button>
                                <span
                                    className={`text-xs font-semibold text-center ${idx <= stepIndex ? 'text-foreground' : 'text-muted-foreground'
                                        }`}
                                >
                                    {FORM_STEP_LABELS[step]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden shadow-sm">
                        <div
                            className="bg-gradient-to-r from-primary via-primary to-primary h-full transition-all duration-700 ease-out shadow-md"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Progress Text */}
                    <p className="text-right text-xs text-muted-foreground mt-2 font-medium">
                        Step {stepIndex + 1} of {FORM_STEPS.length}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
                    <div className="p-8 sm:p-10">
                        {/* Info Banner - Step 1 Only */}
                        {currentStep === 'event' && (
                            <div className="mb-6 flex items-start gap-3 rounded-lg bg-info/10 border border-info/30 p-3">
                                <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-info">
                                    <span className="font-semibold">Complete all required fields</span> (marked with *). Details must match your ID documents.
                                </p>
                            </div>
                        )}

                        {/* Server Error */}
                        {serverError && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg bg-error/10 border border-error/30 p-4">
                                <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                                <p className="text-sm text-error font-medium">{serverError}</p>
                            </div>
                        )}

                        {/* Step Content */}
                        <form onSubmit={handleSubmit}>
                            {currentStep === 'event' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-2xl text-foreground mb-1">
                                            {FORM_STEP_LABELS['event']}
                                        </h2>
                                        <p className="text-muted-foreground text-sm">
                                            Select your event, organization, sport, and category
                                        </p>
                                    </div>

                                    {cascadingData && (
                                        <RegisterFormFields
                                            form={form}
                                            cascadingData={cascadingData}
                                            categories={categories}
                                            step="event"
                                        />
                                    )}
                                </div>
                            )}

                            {currentStep === 'personal' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-2xl text-foreground mb-1">
                                            {FORM_STEP_LABELS['personal']}
                                        </h2>
                                        <p className="text-muted-foreground text-sm">
                                            Provide your personal details in both Khmer and English
                                        </p>
                                    </div>

                                    <RegisterFormFields
                                        form={form}
                                        cascadingData={cascadingData}
                                        categories={categories}
                                        step="personal"
                                    />
                                </div>
                            )}

                            {currentStep === 'documents' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-2xl text-foreground mb-1">
                                            {FORM_STEP_LABELS['documents']}
                                        </h2>
                                        <p className="text-muted-foreground text-sm">
                                            Upload your profile photo, ID, and specify your role
                                        </p>
                                    </div>

                                    <RegisterFormFields
                                        form={form}
                                        cascadingData={cascadingData}
                                        categories={categories}
                                        step="documents"
                                    />
                                </div>
                            )}

                            {currentStep === 'review' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="font-bold text-2xl text-foreground mb-1">
                                            {FORM_STEP_LABELS['review']}
                                        </h2>
                                        <p className="text-muted-foreground text-sm">
                                            Review all information before submitting your registration
                                        </p>
                                    </div>

                                    <RegisterFormFields
                                        form={form}
                                        cascadingData={cascadingData}
                                        categories={categories}
                                        step="review"
                                    />
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center gap-4">
                    <div>
                        {currentStep !== 'event' && (
                            <Button
                                onClick={handleBack}
                                variant="outline"
                                className="flex items-center gap-2 h-11 px-6 font-medium"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back
                            </Button>
                        )}
                    </div>

                    <div>
                        {currentStep !== 'review' ? (
                            <Button
                                onClick={handleNext}
                                variant="default"
                                className="flex items-center gap-2 h-11 px-6 font-medium"
                            >
                                Next
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        ) : (
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isPending}
                                variant="default"
                                className="flex items-center gap-2 h-11 px-6 font-medium"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {isPending ? 'Submitting...' : 'Submit Registration'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
