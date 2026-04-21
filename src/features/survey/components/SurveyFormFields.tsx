'use client';

import { UseFormReturn } from 'react-hook-form';
import type { SurveyFormData, Event, Organization, Sport } from '../types';

interface SurveyFormFieldsProps {
    form: UseFormReturn<SurveyFormData>;
    events: Event[];
    organizations: Organization[];
    eventSports: Sport[];
    step: 'event' | 'organization' | 'sports' | 'review';
}

export function SurveyFormFields({
    form,
    events,
    organizations,
    eventSports,
    step,
}: SurveyFormFieldsProps) {
    const formData = form.getValues();
    const { watch } = form;

    const selectedEventId = watch('eventId');
    const selectedOrgId = watch('organizationId');
    const selectedSportIds = watch('sportIds');

    if (step === 'event') {
        return (
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Select Event
                    </h3>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No events available</div>
                ) : (
                    <div className="grid gap-3">
                        {events.map((event) => (
                            <button
                                key={event.id}
                                type="button"
                                onClick={() => {
                                    form.setValue('eventId', event.id);
                                    form.trigger('eventId');
                                }}
                                className={`p-4 text-left border rounded-lg transition-all ${selectedEventId === event.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <h4 className="font-semibold text-slate-900">{event.name_kh}</h4>
                                {event.type && (
                                    <p className="text-sm text-slate-600 mt-1">{event.type}</p>
                                )}
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
                    <div className="grid gap-3">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                type="button"
                                onClick={() => {
                                    form.setValue('organizationId', org.id);
                                    form.trigger('organizationId');
                                }}
                                className={`p-4 text-left border rounded-lg transition-all ${selectedOrgId === org.id
                                        ? 'border-primary bg-primary/5'
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
                    <div className="text-center py-8 text-slate-500">No sports available for this event</div>
                ) : (
                    <div className="grid gap-3">
                        {eventSports.map((sport) => (
                            <label
                                key={sport.id}
                                className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSportIds.includes(sport.id)}
                                    onChange={(e) => {
                                        const newIds = e.target.checked
                                            ? [...selectedSportIds, sport.id]
                                            : selectedSportIds.filter((id) => id !== sport.id);
                                        form.setValue('sportIds', newIds);
                                        form.trigger('sportIds');
                                    }}
                                    className="w-4 h-4 text-primary"
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
        const selectedSports = eventSports.filter((s) => selectedSportIds.includes(s.id));

        return (
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Review Your Information
                    </h3>
                </div>

                {/* Event Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Event</h4>
                    <p className="text-slate-700">{selectedEvent?.name_kh}</p>
                </div>

                {/* Organization Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Organization</h4>
                    <p className="text-slate-700">{selectedOrg?.name_kh}</p>
                </div>

                {/* Sports Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Sports ({selectedSports.length})</h4>
                    <ul className="space-y-2">
                        {selectedSports.map((sport) => (
                            <li key={sport.id} className="text-slate-700">
                                • {sport.name_kh}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return null;
}
