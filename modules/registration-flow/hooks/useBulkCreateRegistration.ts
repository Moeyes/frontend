import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createRegistration, type ParticipantRecord } from '../services/registration.service';
import { regKeys } from '../services/keys';

export type BulkRowStatus = 'valid' | 'error' | 'pending' | 'success' | 'failed';

export interface BulkRow {
  id: string;
  kh_family_name: string;
  kh_given_name: string;
  en_family_name: string;
  en_given_name: string;
  gender: 'MALE' | 'FEMALE';
  date_of_birth: string;
  phone: string;
  address: string;
}

export interface BulkRowState {
  row: BulkRow;
  status: BulkRowStatus;
  validationError?: string;
  submitError?: string;
  result?: ParticipantRecord;
}

export interface BulkSubmitOptions {
  eventId: number;
  sportId: number;
  organizationId: number | null;
}

export interface BulkProgress {
  done: number;
  total: number;
  failed: number;
}

export function useBulkCreateRegistration() {
  const qc = useQueryClient();
  const [rowStates, setRowStates]   = useState<BulkRowState[]>([]);
  const [progress, setProgress]     = useState<BulkProgress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (
    states: BulkRowState[],
    opts: BulkSubmitOptions,
  ) => {
    const validRows = states.filter((s) => s.status === 'valid');
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setProgress({ done: 0, total: validRows.length, failed: 0 });

    // Mark all valid rows as pending
    setRowStates(states.map((s) =>
      s.status === 'valid' ? { ...s, status: 'pending' } : s,
    ));

    let done = 0;
    let failed = 0;

    for (const state of states) {
      if (state.status !== 'valid') continue;

      try {
        const result = await createRegistration({
          kh_family_name:  state.row.kh_family_name,
          kh_given_name:   state.row.kh_given_name,
          en_family_name:  state.row.en_family_name,
          en_given_name:   state.row.en_given_name,
          gender:          state.row.gender,
          date_of_birth:   state.row.date_of_birth,
          phone:           state.row.phone || null,
          address:         state.row.address || null,
          sport_id:        opts.sportId,
          organization_id: opts.organizationId,
          role:            'athlete',
        });
        done++;
        setRowStates((prev) =>
          prev.map((r) =>
            r.row.id === state.row.id
              ? { ...r, status: 'success', result }
              : r,
          ),
        );
      } catch (err) {
        failed++;
        done++;
        const msg = err instanceof Error ? err.message : String(err);
        setRowStates((prev) =>
          prev.map((r) =>
            r.row.id === state.row.id
              ? { ...r, status: 'failed', submitError: msg }
              : r,
          ),
        );
      }
      setProgress({ done, total: validRows.length, failed });
    }

    setIsSubmitting(false);
    qc.invalidateQueries({ queryKey: regKeys.lists() });
  }, [qc]);

  const reset = useCallback(() => {
    setRowStates([]);
    setProgress(null);
    setIsSubmitting(false);
  }, []);

  return { submit, progress, rowStates, setRowStates, isSubmitting, reset };
}
