'use client';

import { UseFormReturn } from 'react-hook-form';
import type { Event, Organization, Sport } from '../types';

interface PdfFilterFormFieldsProps {
    form: UseFormReturn<any>;
    step: 'event_type' | 'event' | 'sport' | 'organization' | 'preview';
    eventTypes: { id: string | number; name_kh: string }[];
    events: Event[];
    organizations: Organization[];
    sports: Sport[];
    selectedEventType?: string | number | null;
    selectedEventId?: number | null;
    selectedOrgId?: number | null;
    selectedSportId?: number | null;
    onSelectEventType: (id: any) => void;
    onSelectEvent: (id: number) => void;
    onSelectOrg: (id: number) => void;
    onSelectSport: (id: number) => void;
}

export function PdfFilterFormFields({
    form,
    step,
    eventTypes,
    events,
    organizations,
    sports,
    selectedEventType,
    selectedEventId,
    selectedOrgId,
    selectedSportId,
    onSelectEventType,
    onSelectEvent,
    onSelectOrg,
    onSelectSport
}: PdfFilterFormFieldsProps) {
    
    if (step === 'event_type') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        ជ្រើសរើសប្រភេទព្រឹត្តិការណ៍ (Select Category)
                    </h3>
                </div>

                <div className="grid gap-3">
                    {eventTypes.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => onSelectEventType(type.id)}
                            className={`p-4 text-left border rounded-lg transition-all ${selectedEventType === type.id
                                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            <h4 className="font-semibold text-slate-900">{type.name_kh}</h4>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (step === 'event') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        ជ្រើសរើសព្រឹត្តិការណ៍ (Select Event)
                    </h3>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-slate-500">មិនមានព្រឹត្តិការណ៍ក្នុងប្រភេទនេះទេ</p>
                    </div>
                ) : (
                    <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {events.map((event) => (
                            <button
                                key={event.id}
                                type="button"
                                onClick={() => onSelectEvent(event.id)}
                                className={`p-4 text-left border rounded-lg transition-all ${selectedEventId === event.id
                                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <h4 className="font-semibold text-slate-900">{event.name_kh}</h4>
                                <p className="text-xs text-slate-500 mt-1">ID: #{event.id}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (step === 'sport') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        ជ្រើសរើសប្រភេទកីឡា (Select Sport)
                    </h3>
                </div>

                {sports.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-slate-500">មិនមានកីឡាត្រូវបានរកឃើញសម្រាប់ព្រឹត្តិការណ៍នេះទេ</p>
                    </div>
                ) : (
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {sports.map((sport) => (
                            <button
                                key={sport.id}
                                type="button"
                                onClick={() => onSelectSport(sport.id)}
                                className={`p-4 text-left border rounded-lg transition-all flex items-center gap-3 ${selectedSportId === sport.id
                                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {sport.name_kh.charAt(0)}
                                </div>
                                <h4 className="font-semibold text-slate-900">{sport.name_kh}</h4>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (step === 'organization') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        ជ្រើសរើសអង្គភាព (Select Organization)
                    </h3>
                </div>

                {organizations.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-slate-500">មិនមានអង្គភាពត្រូវបានរកឃើញសម្រាប់កីឡានេះទេ</p>
                    </div>
                ) : (
                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                type="button"
                                onClick={() => onSelectOrg(org.id)}
                                className={`p-4 text-left border rounded-lg transition-all ${selectedOrgId === org.id
                                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <h4 className="font-semibold text-slate-900">{org.name_kh}</h4>
                                {org.type && (
                                    <p className="text-sm text-slate-600 mt-1">{org.type}</p>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return null;
}
