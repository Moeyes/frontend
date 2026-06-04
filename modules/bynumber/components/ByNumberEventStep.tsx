'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/utils/cn';
import type { ByNumberFormInput, ByNumberFormData, Event } from '../types';

interface ByNumberEventStepProps {
    form: UseFormReturn<ByNumberFormInput, unknown, ByNumberFormData>;
    events: Event[];
}

const selectableCard = (selected: boolean) =>
    cn(
        'rounded-lg border p-4 text-left leading-relaxed transition-all',
        selected
            ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
            : 'border-border hover:border-primary/40 hover:bg-accent/40',
    );

export function ByNumberEventStep({ form, events }: ByNumberEventStepProps) {
    const { watch, setValue, trigger } = form;
    const t = useTranslations('bynumber');
    const selectedEventId = watch('eventId');

    if (events.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm leading-relaxed text-muted-foreground">
                {t('noEvents')}
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {events.map((event) => (
                <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                        setValue('eventId', event.id);
                        trigger('eventId');
                    }}
                    className={selectableCard(selectedEventId === event.id)}
                >
                    <h4 className="font-medium leading-relaxed text-foreground">{event.name_kh}</h4>
                </button>
            ))}
        </div>
    );
}
