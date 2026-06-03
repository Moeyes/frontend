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

const ALL_STEPS = ['event', 'category', 'personal', 'documents', 'review'] as const;
type Step = (typeof ALL_STEPS)[number];

interface RegisterFormProps {
    /** 'athlete' (default) registers competitors; 'leader' registers team officials (coach, manager, …). */
    mode?: 'athlete' | 'leader';
}

export function RegisterForm({ mode = 'athlete' }: RegisterFormProps = {}) {
    const isLeader = mode === 'leader';
    const { user } = useAuth();
    const t = useTranslations('registration');
    const tCommon = useTranslations('common');
    // Leaders are team officials and do not compete in a category, so that step is skipped.
    const FORM_STEPS = useMemo<readonly Step[]>(
        () => (isLeader ? ['event', 'personal', 'documents', 'review'] : ALL_STEPS),
        [isLeader],
    );
    const [currentStep, setCurrentStep] = useState<Step>('event');
    const [cascadingData, setCascadingData] = useState<CascadingDataLoaded | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registerWindowError, setRegisterWindowError] = useState<string | null>(null);

    const { form, onSubmit, isPending, serverError } = useRegisterForm(() => setIsSuccess(true));

    const stepIndex = FORM_STEPS.indexOf(currentStep);
    const progress = useMemo(() => ((stepIndex + 1) / FORM_STEPS.length) * 100, [stepIndex, FORM_STEPS.length]);
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
            if (isLeader) form.setValue('role', 'leader');
            if (!isInitialized.current && user?.role === UserRole.ORGANIZATION && user.org_id) {
                form.setValue('organizationId', String(user.org_id));
                isInitialized.current = true;
            }
            setLoading(false);
        }
        initialize();
        return () => { active = false; };
    }, [user, form, isLeader]);

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
                // registration_is_open is authoritative (it honours AUTO date
                // windows as well as an admin force-OPEN/CLOSED). The dates are
                // only used to make the closed message more specific.
                if (event.registration_is_open === false) {
                    if (event.registration_open_date && today < event.registration_open_date)
                        setRegisterWindowError(t('registrationOpensOn', { date: event.registration_open_date }));
                    else if (event.registration_close_date && today > event.registration_close_date)
                        setRegisterWindowError(t('registrationClosedOn', { date: event.registration_close_date }));
                    else
                        setRegisterWindowError(t('registrationClosed'));
                } else setRegisterWindowError(null);
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
    }, [currentStep, form, FORM_STEPS]);

    const handleBack = useCallback(() => {
        const idx = FORM_STEPS.indexOf(currentStep);
        if (idx > 0) setCurrentStep(FORM_STEPS[idx - 1]);
    }, [currentStep, FORM_STEPS]);

    const handleStepClick = useCallback((step: Step) => {
        if (FORM_STEPS.indexOf(step) <= stepIndex) setCurrentStep(step);
    }, [stepIndex, FORM_STEPS]);

    const handleRegisterAnother = useCallback(() => {
        const eventValues = { eventType: form.getValues('eventType'), eventId: form.getValues('eventId'), organizationId: form.getValues('organizationId'), sportId: form.getValues('sportId'), categoryId: form.getValues('categoryId'), role: form.getValues('role') };
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
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-semibold leading-snug text-foreground">{t(isLeader ? 'leaderTitle' : 'title')}</h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(isLeader ? 'leaderSubtitle' : 'subtitle')}</p>
                </div>

                <div className="mb-10">
                    <div className="flex justify-between mb-5">
                        {FORM_STEPS.map((step, idx) => (
                            <div key={step} className="flex flex-col items-center flex-1 gap-2">
                                <button type="button" onClick={() => handleStepClick(step)} disabled={idx > stepIndex}
                                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${idx < stepIndex ? 'bg-primary text-primary-foreground' : idx === stepIndex ? 'bg-primary text-primary-foreground ring-4 ring-primary/15' : 'border border-border bg-card text-muted-foreground cursor-not-allowed'}`}>
                                    {idx < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </button>
                                <span className={`hidden max-w-20 text-center text-xs leading-relaxed sm:block ${idx <= stepIndex ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                                    {FORM_STEP_LABELS[step]}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden mb-8">
                    <div className="p-6 sm:p-8">
                        {serverError && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
                                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                                <p className="text-sm leading-relaxed text-destructive">{serverError}</p>
                            </div>
                        )}
                        {registerWindowError && (
                            <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
                                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                                <p className="text-sm leading-relaxed text-destructive">{registerWindowError}</p>
                            </div>
                        )}
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold leading-snug text-foreground">{FORM_STEP_LABELS[currentStep]}</h2>
                                <RegisterFormFields form={form} cascadingData={cascadingData} categories={categories} step={currentStep} mode={mode} />
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
