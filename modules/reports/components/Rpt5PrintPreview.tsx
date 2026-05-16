'use client';
import { forwardRef } from 'react';
import {
  HEADER_LINE1, HEADER_LINE2, HEADER_LINE4, HEADER_LINE5,
  FOOTER_SEEN_LINE, FOOTER_PROVINCE_LINE, FOOTER_LEFT_TITLE, FOOTER_RIGHT_TITLE,
} from '../lib/khmer-header';
import type { Rpt5Input } from '../lib/rpt5-excel';

interface Props { data: Rpt5Input }

export const Rpt5PrintPreview = forwardRef<HTMLDivElement, Props>(function Rpt5PrintPreview({ data }, ref) {
  return (
    <div ref={ref} className="font-['Battambang',_sans-serif] p-8 text-[10pt] text-black bg-white">
      {/* Header */}
      <div className="text-center mb-2 space-y-0.5">
        <p className="font-bold">{HEADER_LINE1}</p>
        <p>{HEADER_LINE2}</p>
        <p>—————————</p>
        <p>{HEADER_LINE4}</p>
        <p>{HEADER_LINE5}</p>
        <p className="font-bold text-[11pt] mt-1">
          បញ្ជីរាយនាមប្រតិភូ គ្រូបង្វឹក កីឡាករ កីឡាការិនីគ្រប់ប្រភេទកីឡា
        </p>
        <p className="font-bold">{data.orgName}</p>
        <p>{data.eventName}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-[8pt] mt-4">
        <thead>
          <tr className="bg-gray-50">
            {['ល.រ', 'គោត្តនាម-នាម', 'ភេទ', 'ថ្ងៃ', 'ខែ', 'ឆ្នាំ', 'សញ្ជាតិ', 'អ.ស.ណ', 'តួនាទី', 'ប្រភេទកីឡា', 'ផ្សេងៗ'].map((h) => (
              <th key={h} className="border border-black px-1 py-0.5 text-center">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.people.length === 0 ? (
            <tr>
              <td colSpan={11} className="border border-black px-3 py-4 text-center text-gray-400">
                គ្មានទិន្នន័យ
              </td>
            </tr>
          ) : (
            data.people.map((p) => (
              <tr key={p.no}>
                <td className="border border-black px-1 py-0.5 text-center">{p.no}</td>
                <td className="border border-black px-1 py-0.5">{p.full_name_kh}</td>
                <td className="border border-black px-1 py-0.5 text-center">{p.gender}</td>
                <td className="border border-black px-1 py-0.5 text-center">{p.dob_day}</td>
                <td className="border border-black px-1 py-0.5 text-center">{p.dob_month}</td>
                <td className="border border-black px-1 py-0.5 text-center">{p.dob_year}</td>
                <td className="border border-black px-1 py-0.5">{p.nationality}</td>
                <td className="border border-black px-1 py-0.5">{p.id_number}</td>
                <td className="border border-black px-1 py-0.5">{p.role}</td>
                <td className="border border-black px-1 py-0.5">{p.sport_name}</td>
                <td className="border border-black px-1 py-0.5">{p.notes}</td>
              </tr>
            ))
          )}
        </tbody>
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
