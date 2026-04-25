'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRegisterForm } from '@/modules/registration/hooks';
import { RegisterFormFields } from './RegisterFormFields';
import { RegistrationSuccess } from './RegistrationSuccess';
import { Button } from '@/shared/ui/button';
import { useAuth, UserRole } from '@/core/auth';
import { loadCascadingData, fetchCategories, type CascadingDataLoaded, type CategoryReference as Category } from '@/core/lib/reference-data';
import { RegisterFormData } from '../services/schema';
import { eventsService } from '@/modules/events/services';
import { useTranslations } from 'next-intl';

const FORM_STEPS = ['event', 'category', 'personal', 'documents', 'review'] as const;
type Step = (typeof FORM_STEPS)[number];

export function RegisterForm() {
    const { user } = useAuth();
    const t = useTranslations('registration');
    const tCommon = useTranslations('common');
    const [currentStep, setCurrentStep] = useState<Step>('event');
    const [cascadingData, setCascadingData] = useState<CascadingDataLoaded | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registerWindowError, setRegisterWindowError] = useState<string | null>(null);

    const { form, onSubmit, isPending, serverError } = useRegisterForm(() => setIsSuccess(true));

    const stepIndex = FORM_STEPS.indexOf(currentStep);
    const progress = useMemo(() => ((stepIndex + 1) / FORM_STEPS.length) * 100, [stepIndex]);
    const isInitialized = useRef(false);

    const FORM_STEP_LABELS: Record<Step, string> = {
        event: t('steps.event'),
        category: t('steps.category'),
        personal: t('steps.personal'),
        documents: t('steps.documents'),
        review: t('steps.review'),
    };

    useEffect(() => {
        let active = true;
        async function initialize() {
            setLoading(true);
            const data = await loadCascadingData();
            if (!active) return;
            setCascadingData(data);
            if (!isInitialized.current && user?.role === UserRole.ORGANIZATION && user.org_id) {
                form.setValue('organizationId', String(user.org_id));
                isInitialized.current = true;
            }
            setLoading(false);
        }
        initialize();
        return () => { active = false; };
    }, [user, form]);

    const sportId = form.watch('sportId');
    const eventId = form.watch('eventId');

    useEffect(() => {
        let active = true;
        async function checkWindow() {
            if (!eventId) { if (active) setRegisterWindowError(null); return; }
            try {
                const event = await eventsService.getEventById(Number(eventId));
                if (!active) return;
                const today = new Date().toISOString().split('T')[0];
                if (event.open_register_date && today < event.open_register_date)
                    setRegisterWindowError(t('registrationOpensOn', { date: event.open_register_date }));
                else if (event.close_register_date && today > event.close_register_date)
                    setRegisterWindowError(t('registrationClosedOn', { date: event.close_register_date }));
                else setRegisterWindowError(null);
            } catch { if (active) setRegisterWindowError(null); }
        }
        checkWindow();
        return () => { active = false; };
    }, [eventId, t]);

    useEffect(() => {
        let active = true;
        if (sportId && eventId) {
            fetchCategories(Number(eventId), Number(sportId)).then(data => { if (active) setCategories(data); });
        } else {
            setTimeout(() => { if (active) setCategories((prev) => prev.length === 0 ? prev : []); }, 0);
        }
        return () => { active = false; };
    }, [sportId, eventId]);

    const handleNext = useCallback(async () => {
        let fieldsToValidate: Array<keyof RegisterFormData> = [];
        if (currentStep === 'event') fieldsToValidate = ['eventType', 'eventId', 'organizationId', 'sportId'];
        else if (currentStep === 'category') fieldsToValidate = ['categoryId'];
        else if (currentStep === 'personal') {
            fieldsToValidate = ['khFamilyName', 'khGivenName', 'enFamilyName', 'enGivenName', 'gender', 'dateOfBirth', 'phone', 'idDocumentType', 'role', 'nationality'];
            if (form.getValues('role') === 'leader') fieldsToValidate.push('leaderRole');
        } else if (currentStep === 'documents') fieldsToValidate = ['photoPath'];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            const idx = FORM_STEPS.indexOf(currentStep);
            if (idx < FORM_STEPS.length - 1) setCurrentStep(FORM_STEPS[idx + 1]);
        }
    }, [currentStep, form]);

    const handleBack = useCallback(() => {
        const idx = FORM_STEPS.indexOf(currentStep);
        if (idx > 0) setCurrentStep(FORM_STEPS[idx - 1]);
    }, [currentStep]);

    const handleStepClick = useCallback((step: Step) => {
        if (FORM_STEPS.indexOf(step) <= stepIndex) setCurrentStep(step);
    }, [stepIndex]);

    const handleRegisterAnother = useCallback(() => {
        const eventValues = { eventType: form.getValues('eventType'), eventId: form.getValues('eventId'), organizationId: form.getValues('organizationId'), sportId: form.getValues('sportId'), categoryId: form.getValues('categoryId') };
        form.reset(eventValues as RegisterFormData);
        setIsSuccess(false);
        setCurrentStep('personal');
    }, [form]);

    if (isSuccess) return <RegistrationSuccess onRegisterAnother={handleRegisterAnother} onGoHome={() => { window.location.href = '/dashboard'; }} />;

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('loadingForm')}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="font-bold text-3xl text-foreground mb-3">{t('title')}</h1>
                    <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
                </div>

                <div className="mb-10">
                    <div className="flex justify-between mb-6">
                        {FORM_STEPS.map((step, idx) => (
                            <div key={step} className="flex flex-col items-center flex-1">
                                <button type="button" onClick={() => handleStepClick(step)} disabled={idx > stepIndex}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all duration-300 ${idx < stepIndex ? 'bg-success text-white' : idx === stepIndex ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-secondary text-muted-foreground cursor-not-allowed'}`}>
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

                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
                    <div className="p-8">
                        {serverError && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg bg-error/10 border border-error/30 p-4">
                                <AlertCircle className="w-5 h-5 text-error shrink-0" />
                                <p className="text-sm text-error font-medium">{serverError}</p>
                            </div>
                        )}
                        {registerWindowError && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
                                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                                <p className="text-sm text-destructive font-medium">{registerWindowError}</p>
                            </div>
                        )}
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-6">
                                <h2 className="font-bold text-2xl text-foreground mb-1">{FORM_STEP_LABELS[currentStep]}</h2>
                                <RegisterFormFields form={form} cascadingData={cascadingData} categories={categories} step={currentStep} />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <Button onClick={handleBack} variant="outline" disabled={currentStep === 'event'} className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />{tCommon('back')}
                    </Button>
                    {currentStep !== 'review' ? (
                        <Button onClick={handleNext} disabled={registerWindowError !== null} className="flex items-center gap-2">
                            {tCommon('next')} <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending || registerWindowError !== null} className="flex items-center gap-2 min-w-35">
                            {isPending ? tCommon('saving') : t('success.registerAnother')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
