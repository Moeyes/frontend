'use client';
import { forwardRef } from 'react';
import {
  HEADER_LINE1, HEADER_LINE2, HEADER_LINE4, HEADER_LINE5,
  FOOTER_SEEN_LINE, FOOTER_PROVINCE_LINE, FOOTER_LEFT_TITLE, FOOTER_RIGHT_TITLE,
} from '../lib/khmer-header';
import type { Rpt3Input, Rpt3SportRow } from '../lib/rpt3-excel';

interface Props { data: Rpt3Input }

// This component renders a printable HTML version of RPT-3.
// Caller wraps in a hidden div and calls window.print().
export const Rpt3PrintPreview = forwardRef<HTMLDivElement, Props>(function Rpt3PrintPreview({ data }, ref) {
  const totals = data.sports.reduce(
    (acc, s) => ({
      dm: acc.dm + s.delegate_m, df: acc.df + s.delegate_f,
      lm: acc.lm + s.leader_m,   lf: acc.lf + s.leader_f,
      cm: acc.cm + s.coach_m,     cf: acc.cf + s.coach_f,
      am: acc.am + s.athlete_m,   af: acc.af + s.athlete_f,
    }),
    { dm: 0, df: 0, lm: 0, lf: 0, cm: 0, cf: 0, am: 0, af: 0 }
  );

  const subM = (s: Rpt3SportRow) => s.delegate_m + s.leader_m + s.coach_m;
  const subF = (s: Rpt3SportRow) => s.delegate_f + s.leader_f + s.coach_f;
  const subA = (s: Rpt3SportRow) => s.athlete_m + s.athlete_f;
  const grand = (s: Rpt3SportRow) => subM(s) + subF(s) + subA(s);

  return (
    <div ref={ref} className="font-['Battambang',_sans-serif] p-8 text-[10pt] text-black bg-white">
      {/* Header */}
      <div className="text-center mb-2 space-y-0.5">
        <p className="font-bold">{HEADER_LINE1}</p>
        <p>{HEADER_LINE2}</p>
        <p>—————————</p>
        <p>{HEADER_LINE4}</p>
        <p>{HEADER_LINE5}</p>
        <p className="font-bold text-[12pt] mt-1">បញ្ជីចំនួនតាមប្រភេទកីឡា</p>
        <p className="font-bold">{data.orgName}</p>
        <p>{data.eventName}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-[8pt] mt-4" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th rowSpan={2} className="border border-black px-1 py-0.5 text-center w-6">ល.រ</th>
            <th rowSpan={2} className="border border-black px-1 py-0.5 text-left w-28">ប្រភេទកីឡា</th>
            <th colSpan={2} className="border border-black px-1 py-0.5 text-center">ប្រតិភូ</th>
            <th colSpan={2} className="border border-black px-1 py-0.5 text-center">ដឹកនាំ</th>
            <th colSpan={2} className="border border-black px-1 py-0.5 text-center">គ្រូបង្វឹក</th>
            <th colSpan={2} className="border border-black px-1 py-0.5 text-center">អត្តពលិក</th>
            <th colSpan={2} className="border border-black px-1 py-0.5 text-center">សរុប</th>
            <th className="border border-black px-1 py-0.5 text-center">សរុប</th>
            <th rowSpan={2} className="border border-black px-1 py-0.5 text-center">សរុបរួម</th>
          </tr>
          <tr>
            {['ប','ស','ប','ស','ប','ស','ប','ស','ប','ស','ប+ស'].map((h, i) => (
              <th key={i} className="border border-black px-1 py-0.5 text-center w-8">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.sports.map((s) => (
            <tr key={s.no}>
              <td className="border border-black px-1 py-0.5 text-center">{s.no}</td>
              <td className="border border-black px-1 py-0.5">{s.sport_name}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.delegate_m || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.delegate_f || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.leader_m || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.leader_f || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.coach_m || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.coach_f || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.athlete_m || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center">{s.athlete_f || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center font-medium">{subM(s) || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center font-medium">{subF(s) || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center font-medium">{subA(s) || ''}</td>
              <td className="border border-black px-1 py-0.5 text-center font-bold">{grand(s) || ''}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-50">
            <td colSpan={2} className="border border-black px-1 py-0.5 text-right">សរុប</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.dm}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.df}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.lm}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.lf}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.cm}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.cf}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.am}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.af}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.dm+totals.lm+totals.cm}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.df+totals.lf+totals.cf}</td>
            <td className="border border-black px-1 py-0.5 text-center">{totals.am+totals.af}</td>
            <td className="border border-black px-1 py-0.5 text-center">
              {totals.dm+totals.lm+totals.cm+totals.df+totals.lf+totals.cf+totals.am+totals.af}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-[9pt]">
        <div>
          <p>{FOOTER_SEEN_LINE}</p>
          <p className="mt-8">{FOOTER_LEFT_TITLE}</p>
        </div>
        <div>
          <p>{FOOTER_PROVINCE_LINE}</p>
          <p className="mt-8">{FOOTER_RIGHT_TITLE}</p>
        </div>
      </div>
    </div>
  );
});
