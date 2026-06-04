'use client';

import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData, RegisterFormInput } from '../schema/registration.schema';
import { SelectField } from '@/shared/form';
import { useTranslations } from 'next-intl';
import { Calendar, Trophy, Building2 } from 'lucide-react';
import type { CascadingDataLoaded } from '@/core/api/referenceData';

interface RegisterEventStepProps {
    form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
    cascadingData: CascadingDataLoaded | null;
    isAdmin: boolean;
}

export function RegisterEventStep({ form, cascadingData, isAdmin }: RegisterEventStepProps) {
    const { control, formState, watch } = form;
    const t = useTranslations('registration.fields');
    const selectedEventType = watch('eventType');

    const eventTypeOptions = cascadingData?.eventTypes.map((type) => ({ value: type, label: type })) || [];
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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        {t('eventType')} <span className="text-destructive">*</span>
                    </label>
                    <SelectField
                        control={control}
                        name="eventType"
                        label=""
                        placeholder={t('selectEventType')}
                        options={eventTypeOptions}
                        required
                        error={formState.errors.eventType?.message}
                    />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {t('event')} <span className="text-destructive">*</span>
                    </label>
                    <SelectField
                        control={control}
                        name="eventId"
                        label=""
                        placeholder={t('selectEvent')}
                        options={eventOptions}
                        required
                        error={formState.errors.eventId?.message}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        {t('organization')} <span className="text-destructive">*</span>
                    </label>
                    <SelectField
                        control={control}
                        name="organizationId"
                        label=""
                        placeholder={t('selectOrganization')}
                        options={orgOptions}
                        required
                        disabled={!isAdmin}
                        error={formState.errors.organizationId?.message}
                    />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        {t('sport')} <span className="text-destructive">*</span>
                    </label>
                    <SelectField
                        control={control}
                        name="sportId"
                        label=""
                        placeholder={t('selectSport')}
                        options={sportOptions}
                        required
                        error={formState.errors.sportId?.message}
                    />
                </div>
            </div>
        </div>
    );
}
