'use client';

import { UseFormReturn } from 'react-hook-form';
import type { SurveyFormData, Event, Organization, Sport } from '../types';

interface SurveyFormFieldsProps {
    form: UseFormReturn<SurveyFormData>;
    events: Event[];
    organizations: Organization[];
    eventSports: Sport[];
    step: 'event_type' | 'event' | 'organization' | 'sports' | 'review';
    eventTypes?: { id: string, name_kh: string }[];
    selectedEventType?: string | null;
    onSelectEventType?: (id: string) => void;
}

export function SurveyFormFields({
    form,
    events,
    organizations,
    eventSports,
    step,
    eventTypes = [],
    selectedEventType,
    onSelectEventType
}: SurveyFormFieldsProps) {
    const { watch, setValue, trigger } = form;

    const selectedEventId = watch('eventId');
    const selectedOrgId = watch('organizationId');
    const selectedSportIds = watch('sportIds') || [];

    if (step === 'event_type') {
        return (
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Select Event Category
                    </h3>
                </div>

                <div className="grid gap-3">
                    {eventTypes.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => onSelectEventType?.(type.id)}
                            className={`p-4 text-left border rounded-lg transition-all ${selectedEventType === type.id
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300'
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
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Select Event
                    </h3>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-slate-500">No events found for this category</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {events.map((event) => (
                            <button
                                key={event.id}
                                type="button"
                                onClick={() => {
                                    setValue('eventId', event.id);
                                    trigger('eventId');
                                }}
                                className={`p-4 text-left border rounded-lg transition-all ${selectedEventId === event.id
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300'
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

    if (step === 'organization') {
        return (
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Select Organization
                    </h3>
                </div>

                {organizations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No organizations available</div>
                ) : (
                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                type="button"
                                onClick={() => {
                                    setValue('organizationId', org.id);
                                    trigger('organizationId');
                                }}
                                className={`p-4 text-left border rounded-lg transition-all ${selectedOrgId === org.id
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300'
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

    if (step === 'sports') {
        return (
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Select Sports
                    </h3>
                </div>

                <p className="text-sm text-slate-600">Select one or more sports for participation</p>

                {eventSports.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-slate-500">No sports available for this event</p>
                    </div>
                ) : (
                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {eventSports.map((sport) => (
                            <label
                                key={`${sport.sports_id}-${sport.id}`}
                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                    selectedSportIds.includes(sport.sports_id)
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSportIds.includes(sport.sports_id)}
                                    onChange={(e) => {
                                        const newIds = e.target.checked
                                            ? [...selectedSportIds, sport.sports_id]
                                            : selectedSportIds.filter((id) => id !== sport.sports_id);
                                        setValue('sportIds', newIds);
                                        trigger('sportIds');
                                    }}
                                    className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary"
                                />
                                <div>
                                    <h4 className="font-semibold text-slate-900">{sport.name_kh}</h4>
                                    {sport.sport_type && (
                                        <p className="text-sm text-slate-600">{sport.sport_type}</p>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                {form.formState.errors.sportIds && (
                    <p className="text-sm text-red-600">{form.formState.errors.sportIds.message}</p>
                )}
            </div>
        );
    }

    if (step === 'review') {
        const selectedEvent = events.find((e) => e.id === selectedEventId);
        const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
        const selectedSports = eventSports.filter((s) => selectedSportIds.includes(s.sports_id));

        return (
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Review Your Information
                    </h3>
                </div>

                {/* Event Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event</h4>
                    <p className="text-slate-900 font-medium">{selectedEvent?.name_kh}</p>
                </div>

                {/* Organization Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Organization</h4>
                    <p className="text-slate-900 font-medium">{selectedOrg?.name_kh}</p>
                </div>

                {/* Sports Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Selected Sports ({selectedSports.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedSports.map((sport) => (
                            <span key={sport.sports_id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-700">
                                {sport.name_kh}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
