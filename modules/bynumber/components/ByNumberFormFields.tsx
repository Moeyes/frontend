'use client';

import { UseFormReturn } from 'react-hook-form';
import type { ByNumberFormInput, ByNumberFormData, Event, Organization } from '../types';

interface ByNumberFormFieldsProps {
    form: UseFormReturn<ByNumberFormInput, unknown, ByNumberFormData>;
    events: Event[];
    organizations: Organization[];
    step: 'event_type' | 'event' | 'organization' | 'sports' | 'review';
    eventTypes?: { id: string, name_kh: string }[];
    selectedEventType?: string | null;
    onSelectEventType?: (id: string) => void;
}

export function ByNumberFormFields({
    form,
    events,
    organizations,
    step,
    eventTypes = [],
    selectedEventType,
    onSelectEventType
}: ByNumberFormFieldsProps) {
    const { watch, setValue, trigger } = form;

    const selectedEventId = watch('eventId');
    const selectedOrgId = watch('organizationId');
    const sports = watch('sports') || [];

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
        if (sports.length === 0) {
            return (
                <div className="space-y-6">
                    <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                            Enter Participant Counts
                        </h3>
                    </div>
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-slate-500 font-medium">No sports registered for this organization</p>
                        <p className="text-slate-400 text-sm mt-1">Please complete the survey first to link sports to your organization.</p>
                    </div>
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

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sport</th>
                                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Athletes (M)</th>
                                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Athletes (F)</th>
                                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Leaders (M)</th>
                                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Leaders (F)</th>
                                <th className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {sports.map((sport, index) => {
                                const subtotal = (sport.athlete_male_count || 0) + (sport.athlete_female_count || 0) + (sport.leader_male_count || 0) + (sport.leader_female_count || 0);
                                return (
                                <tr key={sport.sport_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3 text-sm font-semibold text-slate-900">{sport.sport_name_kh}</td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.athlete_male_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index] = { ...updated[index], athlete_male_count: parseInt(e.target.value) || 0 };
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-center text-sm"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.athlete_female_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index] = { ...updated[index], athlete_female_count: parseInt(e.target.value) || 0 };
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-center text-sm"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.leader_male_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index] = { ...updated[index], leader_male_count: parseInt(e.target.value) || 0 };
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-center text-sm"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={sport.leader_female_count}
                                            onChange={(e) => {
                                                const updated = [...sports];
                                                updated[index] = { ...updated[index], leader_female_count: parseInt(e.target.value) || 0 };
                                                setValue('sports', updated);
                                            }}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-center text-sm"
                                        />
                                    </td>
                                    <td className="p-3 bg-slate-50 text-center font-bold text-slate-700">{subtotal}</td>
                                </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 border-t border-slate-200">
                                <td className="p-3 text-sm font-semibold text-slate-900">Totals</td>
                                <td className="p-3 text-center font-bold">{sports.reduce((s, sp) => s + (sp.athlete_male_count || 0), 0)}</td>
                                <td className="p-3 text-center font-bold">{sports.reduce((s, sp) => s + (sp.athlete_female_count || 0), 0)}</td>
                                <td className="p-3 text-center font-bold">{sports.reduce((s, sp) => s + (sp.leader_male_count || 0), 0)}</td>
                                <td className="p-3 text-center font-bold">{sports.reduce((s, sp) => s + (sp.leader_female_count || 0), 0)}</td>
                                <td className="p-3 text-center font-bold">{sports.reduce((s, sp) => s + ((sp.athlete_male_count||0)+(sp.athlete_female_count||0)+(sp.leader_male_count||0)+(sp.leader_female_count||0)), 0)}</td>
                            </tr>
                        </tfoot>
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
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Participant Summary</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded border border-slate-200">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Total Athletes</p>
                            <p className="text-2xl font-black text-primary">{totalAthletes}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-slate-200">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Total Leaders</p>
                            <p className="text-2xl font-black text-primary">{totalLeaders}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sports Breakdown</p>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-sm border-collapse bg-white">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-2 text-left text-xs font-bold text-slate-500">Sport</th>
                                        <th className="p-2 text-center text-xs font-bold text-slate-500">Athletes</th>
                                        <th className="p-2 text-center text-xs font-bold text-slate-500">Leaders</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {sports.map((sport) => (
                                        <tr key={sport.sport_id}>
                                            <td className="p-2 font-medium text-slate-900">{sport.sport_name_kh}</td>
                                            <td className="p-2 text-center text-slate-700">
                                                {sport.athlete_male_count + sport.athlete_female_count}
                                                <span className="text-xs text-slate-400 ml-1">
                                                    (M:{sport.athlete_male_count} F:{sport.athlete_female_count})
                                                </span>
                                            </td>
                                            <td className="p-2 text-center text-slate-700">
                                                {sport.leader_male_count + sport.leader_female_count}
                                                <span className="text-xs text-slate-400 ml-1">
                                                    (M:{sport.leader_male_count} F:{sport.leader_female_count})
                                                </span>
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
