'use client';

import { cn } from '@/shared/utils/cn';

interface ByNumberEventTypeStepProps {
    eventTypes: { id: string; name_kh: string }[];
    selectedEventType?: string | null;
    onSelectEventType?: (id: string) => void;
}

const selectableCard = (selected: boolean) =>
    cn(
        'rounded-lg border p-4 text-left leading-relaxed transition-all',
        selected
            ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
            : 'border-border hover:border-primary/40 hover:bg-accent/40',
    );

export function ByNumberEventTypeStep({ eventTypes, selectedEventType, onSelectEventType }: ByNumberEventTypeStepProps) {
    return (
        <div className="grid gap-3">
            {eventTypes.map((type) => (
                <button
                    key={type.id}
                    type="button"
                    onClick={() => onSelectEventType?.(type.id)}
                    className={selectableCard(selectedEventType === type.id)}
                >
                    <h4 className="font-medium leading-relaxed text-foreground">{type.name_kh}</h4>
                </button>
            ))}
        </div>
    );
}
