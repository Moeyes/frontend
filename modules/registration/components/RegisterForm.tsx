/**
 * RegisterForm Component
 * 
 * Multi-step registration form with advanced UX
 */

'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRegisterForm } from '@/modules/registration/hooks';
import { RegisterFormFields } from './RegisterFormFields';
import { RegistrationSuccess } from './RegistrationSuccess';
import { Button } from '@/shared/ui/button';
import { useAuth, UserRole } from '@/core/auth';
import {
    loadCascadingData,
    fetchCategories,
    type CascadingDataLoaded,
    type CategoryReference as Category,
} from '@/core/lib/reference-data';
import { RegisterFormData } from '../services/schema';

// Steps definition
const FORM_STEPS = ['event', 'category', 'personal', 'documents', 'review'] as const;
type Step = (typeof FORM_STEPS)[number];

const FORM_STEP_LABELS: Record<Step, string> = {
    event: 'Event & Sport',
    category: 'Category',
    personal: 'Personal Info',
    documents: 'Photo Upload',
    review: 'Review',
};

/**
 * Registration form component with 5-step support and role-based logic
 */
export function RegisterForm() {
    const { user } = useAuth();
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

    const stepIndex = FORM_STEPS.indexOf(currentStep);
    const progress = useMemo(() => ((stepIndex + 1) / FORM_STEPS.length) * 100, [stepIndex]);

    const isInitialized = useRef(false);

    // Load data on mount
    useEffect(() => {
        let active = true;
        async function initialize() {
            setLoading(true);
            const data = await loadCascadingData();
            if (!active) return;
            setCascadingData(data);
            
            // Pre-fill org_id for Province (user1) only ONCE
            if (!isInitialized.current && user?.role === UserRole.ORGANIZATION && user.org_id) {
                form.setValue('organizationId', String(user.org_id));
                isInitialized.current = true;
            }
            
            setLoading(false);
        }
        initialize();
        return () => { active = false; };
    }, [user, form]);

    // Load categories when sport and event change
    const sportId = form.watch('sportId');
    const eventId = form.watch('eventId');

    useEffect(() => {
        let active = true;
        if (sportId && eventId) {
            fetchCategories(Number(eventId), Number(sportId)).then(data => {
                if (active) setCategories(data);
            });
        } else {
            // Use setTimeout to avoid synchronous setState in effect warning
            setTimeout(() => {
                if (active) setCategories((prev) => prev.length === 0 ? prev : []);
            }, 0);
        }
        return () => { active = false; };
    }, [sportId, eventId]);

    const handleNext = useCallback(async () => {
        let fieldsToValidate: Array<keyof RegisterFormData> = [];
        
        if (currentStep === 'event') {
            fieldsToValidate = ['eventType', 'eventId', 'organizationId', 'sportId'];
        } else if (currentStep === 'category') {
            fieldsToValidate = ['categoryId'];
        } else if (currentStep === 'personal') {
            fieldsToValidate = [
                'khFamilyName', 'khGivenName', 'enFamilyName', 'enGivenName',
                'gender', 'dateOfBirth', 'phone', 'idDocumentType', 'role', 'nationality'
            ];
            if (form.getValues('role') === 'leader') {
                fieldsToValidate.push('leaderRole');
            }
        } else if (currentStep === 'documents') {
            fieldsToValidate = ['photoPath'];
        }

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            const currentStepIndex = FORM_STEPS.indexOf(currentStep);
            if (currentStepIndex < FORM_STEPS.length - 1) {
                setCurrentStep(FORM_STEPS[currentStepIndex + 1]);
            }
        }
    }, [currentStep, form]);

    const handleBack = useCallback(() => {
        const currentStepIndex = FORM_STEPS.indexOf(currentStep);
        if (currentStepIndex > 0) {
            setCurrentStep(FORM_STEPS[currentStepIndex - 1]);
        }
    }, [currentStep]);

    const handleStepClick = useCallback((step: Step) => {
        const clickedStepIndex = FORM_STEPS.indexOf(step);
        if (clickedStepIndex <= stepIndex) {
            setCurrentStep(step);
        }
    }, [stepIndex]);

    const handleRegisterAnother = useCallback(() => {
        const eventValues = {
            eventType: form.getValues('eventType'),
            eventId: form.getValues('eventId'),
            organizationId: form.getValues('organizationId'),
            sportId: form.getValues('sportId'),
            categoryId: form.getValues('categoryId'),
        };
        form.reset(eventValues as RegisterFormData);
        setIsSuccess(false);
        setCurrentStep('personal');
    }, [form]);

    const handleGoHome = useCallback(() => {
        window.location.href = '/dashboard';
    }, []);

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
                        Complete all 5 steps to register for the sports event
                    </p>
                </div>

                {/* Enhanced Stepper */}
                <div className="mb-10">
                    <div className="flex justify-between mb-6">
                        {FORM_STEPS.map((step, idx) => (
                            <div key={step} className="flex flex-col items-center flex-1">
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(step)}
                                    disabled={idx > stepIndex}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all duration-300 ${idx < stepIndex
                                        ? 'bg-success text-white'
                                        : idx === stepIndex
                                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                            : 'bg-secondary text-muted-foreground cursor-not-allowed'
                                        }`}
                                >
                                    {idx < stepIndex ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                </button>
                                <span className={`text-[10px] uppercase font-bold text-center ${idx <= stepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {FORM_STEP_LABELS[step]}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
                    <div className="p-8">
                        {serverError && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg bg-error/10 border border-error/30 p-4">
                                <AlertCircle className="w-5 h-5 text-error shrink-0" />
                                <p className="text-sm text-error font-medium">{serverError}</p>
                            </div>
                        )}

                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-6">
                                <div>
                                    <h2 className="font-bold text-2xl text-foreground mb-1">
                                        {FORM_STEP_LABELS[currentStep]}
                                    </h2>
                                </div>

                                <RegisterFormFields
                                    form={form}
                                    cascadingData={cascadingData}
                                    categories={categories}
                                    step={currentStep}
                                />
                            </div>
                        </form>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center gap-4">
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        disabled={currentStep === 'event'}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </Button>

                    {currentStep !== 'review' ? (
                        <Button
                            onClick={handleNext}
                            className="flex items-center gap-2"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isPending}
                            className="flex items-center gap-2 min-w-35"
                        >
                            {isPending ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
