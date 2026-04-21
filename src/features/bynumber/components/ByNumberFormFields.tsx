'use client';

import { UseFormReturn } from 'react-hook-form';
import type { ByNumberFormData, Event, Organization } from '../types';

interface ByNumberFormFieldsProps {
    form: UseFormReturn<ByNumberFormData>;
    events: Event[];
    organizations: Organization[];
    step: 'event' | 'organization' | 'sports' | 'review';
}

export function ByNumberFormFields({
    form,
    events,
    organizations,
    step,
}: ByNumberFormFieldsProps) {
    const { watch, setValue } = form;

    const selectedEventId = watch('eventId');
    const selectedOrgId = watch('organizationId');
    const sports = watch('sports');

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
        if (sports.length === 0) {
            return (
                <div className="space-y-6">
                    <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                            Participant Counts
                        </h3>
                    </div>
                    <div className="text-center py-8 text-slate-500">No sports available for this organization</div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        Enter Participant Counts
                    </h3>
                </div>

                <p className="text-sm text-slate-600">
                    Enter the number of participants by gender and role for each sport
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border p-3 text-left text-sm font-semibold">Sport</th>
                                <th className="border p-3 text-center text-sm font-semibold">Athletes (M)</th>
                                <th className="border p-3 text-center text-sm font-semibold">Athletes (F)</th>
                                <th className="border p-3 text-center text-sm font-semibold">Leaders (M)</th>
                                <th className="border p-3 text-center text-sm font-semibold">Leaders (F)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sports.map((sport, index) => (
                                <tr key={sport.sport_id} className="hover:bg-slate-50">
                                    <td className="border p-3 text-sm font-medium">{sport.sport_name_kh}</td>
                                    <td className="border p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.athlete_male_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index].athlete_male_count = parseInt(e.target.value) || 0;
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1 border rounded text-center text-sm"
                                        />
                                    </td>
                                    <td className="border p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.athlete_female_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index].athlete_female_count = parseInt(e.target.value) || 0;
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1 border rounded text-center text-sm"
                                        />
                                    </td>
                                    <td className="border p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.leader_male_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index].leader_male_count = parseInt(e.target.value) || 0;
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1 border rounded text-center text-sm"
                                        />
                                    </td>
                                    <td className="border p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.leader_female_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index].leader_female_count = parseInt(e.target.value) || 0;
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1 border rounded text-center text-sm"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {form.formState.errors.sports && (
                    <p className="text-sm text-red-600">{form.formState.errors.sports.message}</p>
                )}
            </div>
        );
    }

    if (step === 'review') {
        const selectedEvent = events.find((e) => e.id === selectedEventId);
        const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

        const totalAthletes = sports.reduce(
            (sum, s) => sum + s.athlete_male_count + s.athlete_female_count,
            0
        );
        const totalLeaders = sports.reduce(
            (sum, s) => sum + s.leader_male_count + s.leader_female_count,
            0
        );

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
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Participant Summary</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded border">
                            <p className="text-xs text-slate-600">Total Athletes</p>
                            <p className="text-2xl font-bold text-primary">{totalAthletes}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                            <p className="text-xs text-slate-600">Total Leaders</p>
                            <p className="text-2xl font-bold text-primary">{totalLeaders}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Sports Breakdown:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-200">
                                        <th className="border p-2 text-left">Sport</th>
                                        <th className="border p-2 text-center">Athletes</th>
                                        <th className="border p-2 text-center">Leaders</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sports.map((sport) => (
                                        <tr key={sport.sport_id} className="hover:bg-slate-100">
                                            <td className="border p-2">{sport.sport_name_kh}</td>
                                            <td className="border p-2 text-center">
                                                {sport.athlete_male_count + sport.athlete_female_count} (M: {sport.athlete_male_count}, F: {sport.athlete_female_count})
                                            </td>
                                            <td className="border p-2 text-center">
                                                {sport.leader_male_count + sport.leader_female_count} (M: {sport.leader_male_count}, F: {sport.leader_female_count})
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
