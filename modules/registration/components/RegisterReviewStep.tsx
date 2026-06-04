'use client';

import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData, RegisterFormInput } from '../schema/registration.schema';
import { useTranslations } from 'next-intl';
import { Trophy, User, CheckCircle2 } from 'lucide-react';
import type { CascadingDataLoaded } from '@/core/api/referenceData';
import type { CategoryReference as Category } from '@/core/api/referenceData';

interface RegisterReviewStepProps {
    form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
    cascadingData: CascadingDataLoaded | null;
    categories: Category[];
    mode?: 'athlete' | 'leader';
}

const ReviewField = ({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) => (
    <div className="flex flex-col">
        <p className="mb-1 text-xs font-medium leading-relaxed text-muted-foreground">
            {label}
        </p>
        <p className="text-sm font-medium leading-relaxed text-foreground">{value || '\u2014'}</p>
    </div>
);

export function RegisterReviewStep({ form, cascadingData, categories, mode = 'athlete' }: RegisterReviewStepProps) {
    const isLeader = mode === 'leader';
    const formData = form.getValues();
    const t = useTranslations('registration.fields');
    const tReview = useTranslations('registration.review');

    const selectedEventType = formData.eventType;
    const filteredEvents = selectedEventType
        ? cascadingData?.events.filter((e) => e.type === selectedEventType) || []
        : [];
    const eventOptions = filteredEvents.map((e) => ({
        value: String(e.id),
        label: e.name_kh || e.name_en || 'Event',
    }));
    const orgOptions = cascadingData?.organizations.map((o) => ({
        value: String(o.id),
        label: o.name_kh || o.name_en || 'Organization',
    })) || [];
    const sportOptions = cascadingData?.sports.map((s) => ({
        value: String(s.id),
        label: s.name_kh || s.name_en || 'Sport',
    })) || [];
    const categoryOptions = categories.map((c) => ({
        value: String(c.id),
        label: c.category,
    }));

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold leading-snug text-foreground">
                        <Trophy className="h-4 w-4 text-primary" />
                        {tReview('eventDetails')}
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                        <ReviewField
                            label={t('event')}
                            value={
                                eventOptions.find((o) => o.value === String(formData.eventId))
                                    ?.label
                            }
                        />
                        <ReviewField
                            label={t('organization')}
                            value={
                                orgOptions.find(
                                    (o) => o.value === String(formData.organizationId),
                                )?.label
                            }
                        />
                        <ReviewField
                            label={t('sport')}
                            value={
                                sportOptions.find((o) => o.value === String(formData.sportId))
                                    ?.label
                            }
                        />
                        {!isLeader && (
                            <ReviewField
                                label={t('category')}
                                value={
                                    categoryOptions.find(
                                        (o) => o.value === String(formData.categoryId),
                                    )?.label
                                }
                            />
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold leading-snug text-foreground">
                        <User className="h-4 w-4 text-primary" />
                        {tReview('personalInfo')}
                    </h3>
                    <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                        <ReviewField
                            label={tReview('khmerName')}
                            value={`${formData.khFamilyName} ${formData.khGivenName}`}
                        />
                        <ReviewField
                            label={tReview('englishName')}
                            value={`${formData.enFamilyName} ${formData.enGivenName}`}
                        />
                        <ReviewField label={tReview('gender')} value={formData.gender} />
                        <ReviewField label={tReview('phone')} value={formData.phone} />
                        <ReviewField
                            label={tReview('role')}
                            value={
                                formData.role === 'leader'
                                    ? tReview('leader', {
                                        leaderRole: formData.leaderRole || '',
                                    })
                                    : tReview('athlete')
                            }
                        />
                    </div>
                </div>
            </div>
            {formData.photoPath && (
                <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 p-4">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium leading-relaxed text-success">
                        {t('photoUploaded')}
                    </span>
                </div>
            )}
        </div>
    );
}
