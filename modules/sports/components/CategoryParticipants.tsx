'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Loader2, RotateCcw, User as UserIcon } from 'lucide-react';
import { Category, SportParticipant } from '../types';
import { useSportParticipants } from '../hooks';
import { useEvents } from '@/modules/events/hooks';
import { useOrganizations } from '@/modules/organizations/hooks';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared';

interface CategoryParticipantsProps {
    sportId: number;
    category: Category;
}

type TypeFilter = 'all' | 'athlete' | 'leader';

/** Compute integer age (years) from an ISO date string. */
function ageFromDob(dob?: string | null): number | null {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
    return age;
}

const ALL = '__all__';

export function CategoryParticipants({ sportId, category }: CategoryParticipantsProps) {
    const t = useTranslations('sports.participants');

    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [eventFilter, setEventFilter] = useState(''); // '' = all
    const [orgFilter, setOrgFilter] = useState(''); // '' = all
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');

    // Skip the query we don't need based on the type filter.
    const athletesQ = useSportParticipants(sportId, 'athlete', typeFilter !== 'leader');
    const leadersQ = useSportParticipants(sportId, 'leader', typeFilter !== 'athlete');
    const { data: events } = useEvents();
    const { data: organizations } = useOrganizations();

    const isLoading =
        (typeFilter !== 'leader' && athletesQ.isLoading) ||
        (typeFilter !== 'athlete' && leadersQ.isLoading);

    const eventName = (id?: number | null) =>
        id == null ? null : events?.find((e) => e.id === id)?.name ?? null;

    const rows = useMemo(() => {
        // Category constrains athletes only; leaders are sport-scoped.
        const athletes = (athletesQ.data ?? []).filter((a) => a.category?.id === category.id);
        const leaders = leadersQ.data ?? [];
        let list: SportParticipant[] =
            typeFilter === 'athlete'
                ? athletes
                : typeFilter === 'leader'
                  ? leaders
                  : [...athletes, ...leaders];

        if (eventFilter) list = list.filter((p) => String(p.event_id ?? '') === eventFilter);
        if (orgFilter) list = list.filter((p) => String(p.organization?.id ?? '') === orgFilter);

        const min = ageMin ? Number(ageMin) : null;
        const max = ageMax ? Number(ageMax) : null;
        if (min != null || max != null) {
            list = list.filter((p) => {
                const age = ageFromDob(p.date_of_birth);
                if (age == null) return false;
                if (min != null && age < min) return false;
                if (max != null && age > max) return false;
                return true;
            });
        }
        return list;
    }, [athletesQ.data, leadersQ.data, category.id, typeFilter, eventFilter, orgFilter, ageMin, ageMax]);

    const selectedEventName = events?.find((e) => String(e.id) === eventFilter)?.name;
    const selectedOrgName = organizations?.find((o) => String(o.id) === orgFilter)?.name_kh;

    const hasFilters = typeFilter !== 'all' || !!eventFilter || !!orgFilter || !!ageMin || !!ageMax;
    const resetFilters = () => {
        setTypeFilter('all');
        setEventFilter('');
        setOrgFilter('');
        setAgeMin('');
        setAgeMax('');
    };

    return (
        <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    {t('title', { category: category.category })}
                </h4>
                <Badge variant="secondary">{t('count', { count: rows.length })}</Badge>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase text-muted-foreground">{t('type')}</label>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter((v as TypeFilter) || 'all')}>
                        <SelectTrigger className="w-full">
                            <SelectValue>{t(`types.${typeFilter}`)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('types.all')}</SelectItem>
                            <SelectItem value="athlete">{t('types.athlete')}</SelectItem>
                            <SelectItem value="leader">{t('types.leader')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase text-muted-foreground">{t('event')}</label>
                    <Select value={eventFilter || ALL} onValueChange={(v) => setEventFilter(v && v !== ALL ? v : '')}>
                        <SelectTrigger className="w-full">
                            <SelectValue>{selectedEventName || t('allEvents')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>{t('allEvents')}</SelectItem>
                            {events?.map((e) => (
                                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase text-muted-foreground">{t('organization')}</label>
                    <Select value={orgFilter || ALL} onValueChange={(v) => setOrgFilter(v && v !== ALL ? v : '')}>
                        <SelectTrigger className="w-full">
                            <SelectValue>{selectedOrgName || t('allOrgs')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>{t('allOrgs')}</SelectItem>
                            {organizations?.map((o) => (
                                <SelectItem key={o.id} value={String(o.id)}>{o.name_kh}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase text-muted-foreground">{t('age')}</label>
                    <div className="flex items-center gap-2">
                        <Input type="number" min="0" inputMode="numeric" placeholder={t('min')} value={ageMin}
                            onChange={(e) => setAgeMin(e.target.value)} className="h-10" />
                        <span className="text-muted-foreground">–</span>
                        <Input type="number" min="0" inputMode="numeric" placeholder={t('max')} value={ageMax}
                            onChange={(e) => setAgeMax(e.target.value)} className="h-10" />
                    </div>
                </div>
            </div>

            {hasFilters && (
                <button onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
                    <RotateCcw className="h-3.5 w-3.5" />{t('resetFilters')}
                </button>
            )}

            {/* Results */}
            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : rows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    {t('noResults')}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                                <th className="p-3 font-semibold">{t('columns.participant')}</th>
                                <th className="p-3 font-semibold">{t('columns.type')}</th>
                                <th className="p-3 font-semibold">{t('columns.age')}</th>
                                <th className="p-3 font-semibold">{t('columns.gender')}</th>
                                <th className="p-3 font-semibold">{t('columns.organization')}</th>
                                <th className="p-3 font-semibold">{t('columns.event')}</th>
                                <th className="p-3 font-semibold">{t('columns.detail')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((p) => {
                                const age = ageFromDob(p.date_of_birth);
                                return (
                                    <tr key={`${p.role}-${p.participant_id}`} className="hover:bg-muted/30">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">{p.name_kh?.trim() || p.name_en}</span>
                                                    {p.phone && <span className="text-[11px] text-muted-foreground">{p.phone}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={p.role === 'athlete' ? 'info' : 'secondary'}>
                                                {t(`types.${p.role}`)}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-foreground">{age ?? '—'}</td>
                                        <td className="p-3 text-sm text-muted-foreground">{p.gender || '—'}</td>
                                        <td className="p-3 text-sm text-muted-foreground">{p.organization?.name || '—'}</td>
                                        <td className="p-3 text-sm text-muted-foreground">{eventName(p.event_id) || '—'}</td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {p.role === 'athlete'
                                                ? p.category?.name || '—'
                                                : p.leader_role
                                                  ? p.leader_role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                                                  : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
