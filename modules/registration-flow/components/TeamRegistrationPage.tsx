'use client';
import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter }        from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver }      from '@hookform/resolvers/zod';
import { z }                from 'zod';
import { AlertTriangle, Download, Upload, CheckCircle2, XCircle, Loader2, Users } from 'lucide-react';
import {
  Button, Badge, BackLink, PageHeader, ContentPanel,
} from '@/shared/ui';
import { SelectField } from '@/shared/form';
import { useEffectiveOrgId } from '@/core/auth';
import { computeAgeAtEvent } from '@/core/lib';
import { MINOR_AGE_THRESHOLD, ROUTES } from '@/core/config';
import { useEvents, useEventSports, useEvent } from '@/modules/events';
import {
  useBulkCreateRegistration,
  type BulkRow, type BulkRowState, type BulkRowStatus,
} from '../hooks/useBulkCreateRegistration';

// ── Setup form schema ─────────────────────────────────────────────────────────
const setupSchema = z.object({
  event_id: z.number({ message: 'registration.validation.eventRequired' }).positive(),
  sport_id: z.number({ message: 'registration.validation.sportRequired' }).positive(),
});
type SetupValues = z.infer<typeof setupSchema>;

// ── CSV template header ───────────────────────────────────────────────────────
const CSV_HEADERS = [
  'kh_family_name', 'kh_given_name',
  'en_family_name', 'en_given_name',
  'gender', 'date_of_birth', 'phone', 'address',
];

type PageView = 'setup' | 'upload' | 'submitting' | 'results';

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Status badge variant map ──────────────────────────────────────────────────
const STATUS_VARIANT: Record<BulkRowStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  valid:    'secondary',
  error:    'destructive',
  pending:  'outline',
  success:  'default',
  failed:   'destructive',
};

export function TeamRegistrationPage() {
  const t  = useTranslations('registration');
  const tc = useTranslations('common');
  const router = useRouter();
  const orgId  = useEffectiveOrgId();

  const [view, setView]           = useState<PageView>('setup');
  const [setup, setSetup]         = useState<SetupValues | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bulk = useBulkCreateRegistration();
  const eventQuery = useEvent(setup?.event_id ?? 0);
  const eventsQuery = useEvents({ limit: 100 });
  const sportsQuery = useEventSports(setup?.event_id ?? 0);

  // Setup form
  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { event_id: undefined, sport_id: undefined },
  });
  const watchedEventId = useWatch({ control: form.control, name: 'event_id' });

  const eventOptions = (eventsQuery.data?.data ?? []).map((e) => ({
    value: String(e.id), label: e.name_kh,
  }));
  const sportOptions = (sportsQuery.data ?? []).map((s) => ({
    value: String(s.id ?? ''), label: s.sport_name ?? '—',
  }));

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSetupNext = (values: SetupValues) => {
    setSetup({ event_id: Number(values.event_id), sport_id: Number(values.sport_id) });
    bulk.reset();
    setParseError(null);
    setView('upload');
  };

  const downloadTemplate = () => {
    const sample = [
      CSV_HEADERS.join(','),
      'សុខ,ដារ៉ា,Sok,Dara,MALE,2005-03-15,012345678,ភ្នំពេញ',
    ].join('\n');
    const bom   = '﻿';
    const blob  = new Blob([bom + sample], { type: 'text/csv;charset=utf-8;' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = 'team_registration_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text  = (ev.target?.result as string).replace(/^﻿/, ''); // strip BOM
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setParseError(t('teamMode.noRows'));
          return;
        }
        const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
        const eventStartDate = eventQuery.data?.start_date ?? null;

        const states: BulkRowState[] = lines.slice(1).map((line, idx) => {
          const cols   = parseCsvLine(line);
          const get    = (key: string) => cols[header.indexOf(key)] ?? '';
          const rowId  = String(idx + 2); // 1-indexed, offset for header

          const row: BulkRow = {
            id:             rowId,
            kh_family_name: get('kh_family_name'),
            kh_given_name:  get('kh_given_name'),
            en_family_name: get('en_family_name'),
            en_given_name:  get('en_given_name'),
            gender:         get('gender').toUpperCase() as 'MALE' | 'FEMALE',
            date_of_birth:  get('date_of_birth'),
            phone:          get('phone'),
            address:        get('address'),
          };

          // Validate required fields
          const missing: string[] = [];
          if (!row.kh_family_name) missing.push('kh_family_name');
          if (!row.kh_given_name)  missing.push('kh_given_name');
          if (!row.en_family_name) missing.push('en_family_name');
          if (!row.en_given_name)  missing.push('en_given_name');
          if (!row.gender || !['MALE', 'FEMALE'].includes(row.gender)) missing.push('gender');
          if (!row.date_of_birth || !/^\d{4}-\d{2}-\d{2}$/.test(row.date_of_birth))
            missing.push('date_of_birth (YYYY-MM-DD)');

          if (missing.length > 0) {
            return { row, status: 'error', validationError: missing.join(', ') };
          }

          // Age check (informational — Red Line #3: always use event date)
          if (eventStartDate) {
            const age = computeAgeAtEvent(row.date_of_birth, eventStartDate);
            if (age === null || age < 0 || age > 120) {
              return {
                row, status: 'error',
                validationError: t('teamMode.invalidDob'),
              };
            }
          }

          return { row, status: 'valid' };
        });

        bulk.setRowStates(states);
      } catch (err) {
        setParseError(String(err));
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected after fixing
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!setup) return;
    setView('submitting');
    await bulk.submit(bulk.rowStates, {
      eventId:        setup.event_id,
      sportId:        setup.sport_id,
      organizationId: orgId,
    });
    setView('results');
  };

  const validCount   = bulk.rowStates.filter((r) => r.status === 'valid').length;
  const errorCount   = bulk.rowStates.filter((r) => r.status === 'error').length;
  const successCount = bulk.rowStates.filter((r) => r.status === 'success').length;
  const failedCount  = bulk.rowStates.filter((r) => r.status === 'failed').length;
  const eventName    = eventQuery.data?.name_kh ?? '';
  const sportName    = (sportsQuery.data ?? []).find((s) => s.id === setup?.sport_id)?.sport_name ?? '';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      <BackLink href={ROUTES.register.home} label={t('backToList')} />
      <PageHeader
        title={t('teamMode.title')}
        description={t('teamMode.subtitle')}
      />

      {/* ── SETUP VIEW ────────────────────────────────────────────────────── */}
      {view === 'setup' && (
        <ContentPanel>
          <form onSubmit={form.handleSubmit(handleSetupNext)} className="space-y-4">
            <SelectField
              control={form.control as never}
              name="event_id"
              labelKey="registration.selectEvent"
              options={eventOptions}
              required
            />
            <SelectField
              control={form.control as never}
              name="sport_id"
              labelKey="registration.selectSport"
              options={sportOptions}
              required
              disabled={!watchedEventId}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit">{tc('next')} →</Button>
            </div>
          </form>
        </ContentPanel>
      )}

      {/* ── UPLOAD VIEW ───────────────────────────────────────────────────── */}
      {view === 'upload' && setup && (
        <div className="space-y-4">
          {/* Context banner */}
          <div className="rounded-md bg-muted px-4 py-3 text-sm">
            <span className="font-medium">{eventName}</span>
            {sportName && <span className="text-muted-foreground"> — {sportName}</span>}
          </div>

          {/* Document note */}
          <div className="flex items-start gap-3 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">{t('teamMode.docNoteTitle')}</p>
              <p className="mt-0.5 text-xs">{t('teamMode.docNoteBody')}</p>
            </div>
          </div>

          <ContentPanel>
            <div className="space-y-4">
              {/* Template download */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('teamMode.downloadTemplate')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('teamMode.uploadHint')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  CSV
                </Button>
              </div>

              <hr />

              {/* File upload */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label={t('teamMode.uploadCsv')}
                />
                <Button
                  variant="outline"
                  className="gap-2 w-full"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {t('teamMode.uploadCsv')}
                </Button>
              </div>

              {parseError && (
                <p className="text-sm text-destructive">{parseError}</p>
              )}
            </div>
          </ContentPanel>

          {/* Preview table */}
          {bulk.rowStates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{t('teamMode.previewTitle', { count: bulk.rowStates.length })}</span>
                {validCount > 0 && (
                  <Badge variant="secondary">
                    <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                    {t('teamMode.validRows', { count: validCount })}
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                    {t('teamMode.invalidRows', { count: errorCount })}
                  </Badge>
                )}
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.row')}</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.name')}</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.gender')}</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.dob')}</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.docRequired')}</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulk.rowStates.map((state) => {
                      const eventStartDate = eventQuery.data?.start_date ?? null;
                      const age = (eventStartDate && state.row.date_of_birth)
                        ? computeAgeAtEvent(state.row.date_of_birth, eventStartDate)
                        : null;
                      const isMinor = age !== null ? age < MINOR_AGE_THRESHOLD : null;
                      const docNote = isMinor === true
                        ? t('teamMode.docNote.birthCert')
                        : isMinor === false
                          ? t('teamMode.docNote.idOrPassport')
                          : '—';

                      return (
                        <tr key={state.row.id} className="border-t">
                          <td className="px-3 py-2 tabular-nums text-muted-foreground">{state.row.id}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium">{state.row.kh_family_name} {state.row.kh_given_name}</p>
                            <p className="text-xs text-muted-foreground">{state.row.en_family_name} {state.row.en_given_name}</p>
                          </td>
                          <td className="px-3 py-2">{state.row.gender}</td>
                          <td className="px-3 py-2 tabular-nums">{state.row.date_of_birth}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{docNote}</td>
                          <td className="px-3 py-2">
                            {state.status === 'error' ? (
                              <div>
                                <Badge variant={STATUS_VARIANT[state.status]}>
                                  {t(`teamMode.status.${state.status}`)}
                                </Badge>
                                <p className="text-xs text-destructive mt-1">{state.validationError}</p>
                              </div>
                            ) : (
                              <Badge variant={STATUS_VARIANT[state.status]}>
                                {t(`teamMode.status.${state.status}` as Parameters<typeof t>[0])}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setView('setup'); bulk.reset(); }}
                >
                  ← {t('teamMode.backToSetup')}
                </Button>
                <Button
                  disabled={validCount === 0}
                  onClick={handleSubmit}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {t('teamMode.submitBatch', { count: validCount })}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUBMITTING VIEW ───────────────────────────────────────────────── */}
      {view === 'submitting' && bulk.progress && (
        <ContentPanel>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">
                {t('teamMode.submitting', {
                  done:  bulk.progress.done,
                  total: bulk.progress.total,
                })}
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(bulk.progress.done / bulk.progress.total) * 100}%` }}
                role="progressbar"
                aria-valuenow={bulk.progress.done}
                aria-valuemax={bulk.progress.total}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {bulk.progress.done} / {bulk.progress.total}
              {bulk.progress.failed > 0 && ` — ${bulk.progress.failed} ${tc('failed')}`}
            </p>
          </div>
        </ContentPanel>
      )}

      {/* ── RESULTS VIEW ──────────────────────────────────────────────────── */}
      {view === 'results' && (
        <div className="space-y-4">
          <ContentPanel>
            <div className="flex items-center gap-4 text-sm">
              {successCount > 0 && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span className="font-medium">{t('teamMode.done', { success: successCount, failed: failedCount })}</span>
                </div>
              )}
              {failedCount > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                </div>
              )}
            </div>
          </ContentPanel>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.row')}</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.name')}</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t('teamMode.columns.status')}</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{tc('note')}</th>
                </tr>
              </thead>
              <tbody>
                {bulk.rowStates.map((state) => (
                  <tr key={state.row.id} className="border-t">
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{state.row.id}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{state.row.kh_family_name} {state.row.kh_given_name}</p>
                      <p className="text-xs text-muted-foreground">{state.row.en_family_name} {state.row.en_given_name}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={STATUS_VARIANT[state.status]}>
                        {t(`teamMode.status.${state.status}` as Parameters<typeof t>[0])}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {state.submitError ?? state.validationError ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => router.push(ROUTES.register.home)}>
              {t('backToList')}
            </Button>
            <Button
              variant="outline"
              onClick={() => { bulk.reset(); setSetup(null); setView('setup'); }}
            >
              {t('teamMode.newBatch')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
