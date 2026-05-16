import * as XLSX from 'xlsx';
import {
  HEADER_LINE1, HEADER_LINE2, HEADER_LINE4, HEADER_LINE5,
  FOOTER_SEEN_LINE, FOOTER_PROVINCE_LINE, FOOTER_LEFT_TITLE, FOOTER_RIGHT_TITLE,
} from './khmer-header';

// RPT-3 column layout (14 columns: A-N)
// A=No, B=Sport, C=DelegM, D=DelegF, E=LeaderM, F=LeaderF,
// G=CoachM, H=CoachF, I=AthlM, J=AthlF, K=SubM, L=SubF, M=SubAthl, N=Grand

const RPT3_TITLE = 'បញ្ជីចំនួនតាមប្រភេទកីឡា';

export interface Rpt3SportRow {
  no: number;
  sport_name: string;
  delegate_m: number; delegate_f: number;
  leader_m:   number; leader_f:   number;
  coach_m:    number; coach_f:    number;
  athlete_m:  number; athlete_f:  number;
}

export interface Rpt3Input {
  orgName:   string;
  eventName: string;
  sports:    Rpt3SportRow[];
}

const col = (c: number) => XLSX.utils.encode_col(c - 1); // 1-indexed column letter

function formula(str: string) {
  return { t: 'n' as const, f: str, v: 0 };
}

export function generateRpt3Excel(input: Rpt3Input): XLSX.WorkBook {
  const ws: XLSX.WorkSheet = {};
  const merges: XLSX.Range[] = [];
  const N_COLS = 14; // A..N

  const set = (r: number, c: number, v: XLSX.CellObject | string | number) => {
    const addr = XLSX.utils.encode_cell({ r: r - 1, c: c - 1 });
    ws[addr] = typeof v === 'string' ? { t: 's', v }
              : typeof v === 'number' ? { t: 'n', v }
              : v;
  };

  const merge = (r1: number, c1: number, r2: number, c2: number) => {
    merges.push({ s: { r: r1 - 1, c: c1 - 1 }, e: { r: r2 - 1, c: c2 - 1 } });
  };

  // ── Rows 1-8: Ministry header band ──
  set(1, 1, HEADER_LINE1);  merge(1, 1, 1, N_COLS);
  set(2, 1, HEADER_LINE2);  merge(2, 1, 2, N_COLS);
  // row 3: decorative — leave empty merged
  merge(3, 1, 3, N_COLS);
  set(4, 1, HEADER_LINE4);  merge(4, 1, 4, N_COLS);
  set(5, 1, HEADER_LINE5);  merge(5, 1, 5, N_COLS);
  set(6, 1, RPT3_TITLE);    merge(6, 1, 6, N_COLS);
  set(7, 1, input.orgName);  merge(7, 1, 7, N_COLS);
  set(8, 1, input.eventName); merge(8, 1, 8, N_COLS);

  // ── Row 9: Column group headers ──
  set(9, 1, 'ល.រ');       merge(9, 1, 10, 1);
  set(9, 2, 'ប្រភេទកីឡា'); merge(9, 2, 10, 2);
  set(9, 3, 'ប្រតិភូ');    merge(9, 3, 9, 4);
  set(9, 5, 'ដឹកនាំ');     merge(9, 5, 9, 6);
  set(9, 7, 'គ្រូបង្វឹក');  merge(9, 7, 9, 8);
  set(9, 9, 'អត្តពលិក');   merge(9, 9, 9, 10);
  set(9, 11, 'សរុប');      merge(9, 11, 9, 13);
  set(9, 14, 'សរុបរួម');   merge(9, 14, 10, 14);

  // ── Row 10: M/F sub-headers ──
  const MF = ['ប', 'ស'];
  [3, 5, 7, 9, 11, 12].forEach((c, i) => {
    set(10, c, MF[i % 2 === 0 ? 0 : 1]);
    if (i < 4) set(10, c + 1, MF[1]);
  });
  // Correct M/F pairs
  set(10, 3, 'ប'); set(10, 4, 'ស');
  set(10, 5, 'ប'); set(10, 6, 'ស');
  set(10, 7, 'ប'); set(10, 8, 'ស');
  set(10, 9, 'ប'); set(10, 10, 'ស');
  set(10, 11, 'ប'); set(10, 12, 'ស');
  set(10, 13, 'សរុប');

  // ── Rows 11+: Sport data rows ──
  const DATA_START = 11;
  input.sports.forEach((sport, idx) => {
    const r = DATA_START + idx;
    set(r, 1, sport.no);
    set(r, 2, sport.sport_name);
    set(r, 3, sport.delegate_m);
    set(r, 4, sport.delegate_f);
    set(r, 5, sport.leader_m);
    set(r, 6, sport.leader_f);
    set(r, 7, sport.coach_m);
    set(r, 8, sport.coach_f);
    set(r, 9, sport.athlete_m);
    set(r, 10, sport.athlete_f);
    // Computed formulas (matching REPORTS_SPEC.md)
    set(r, 11, formula(`=${col(3)}${r}+${col(5)}${r}+${col(7)}${r}`));           // K = delegate_m+leader_m+coach_m
    set(r, 12, formula(`=${col(4)}${r}+${col(6)}${r}+${col(8)}${r}`));           // L = delegate_f+leader_f+coach_f
    set(r, 13, formula(`=${col(9)}${r}+${col(10)}${r}`));                         // M = athlete_m+athlete_f
    set(r, 14, formula(`=${col(11)}${r}+${col(12)}${r}+${col(13)}${r}`));         // N = K+L+M (everyone)
  });

  // ── Total row ──
  const TOTAL_ROW = DATA_START + input.sports.length;
  set(TOTAL_ROW, 1, 'សរុប'); merge(TOTAL_ROW, 1, TOTAL_ROW, 2);
  for (let c = 3; c <= 14; c++) {
    const endData = DATA_START + input.sports.length - 1;
    set(TOTAL_ROW, c, formula(`=SUM(${col(c)}${DATA_START}:${col(c)}${endData})`));
  }

  // ── Footer (2 rows after blank row) ──
  const F1 = TOTAL_ROW + 2;
  const F2 = F1 + 1;
  const F3 = F2 + 1;
  set(F1, 5, 'ថ្ងៃ............ខែ............ឆ្នាំ.........'); merge(F1, 5, F1, N_COLS);
  set(F2, 1, FOOTER_SEEN_LINE); merge(F2, 1, F2, 4);
  set(F2, 5, FOOTER_PROVINCE_LINE); merge(F2, 5, F2, N_COLS);
  set(F3, 1, FOOTER_LEFT_TITLE); merge(F3, 1, F3, 4);
  set(F3, 5, FOOTER_RIGHT_TITLE); merge(F3, 5, F3, N_COLS);

  // Worksheet range
  const lastRow = F3 + 1;
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: N_COLS - 1 } });
  ws['!merges'] = merges;

  // Column widths
  ws['!cols'] = [
    { wch: 5 },  // A: No
    { wch: 24 }, // B: Sport name
    { wch: 6 }, { wch: 6 }, // C-D: Delegate
    { wch: 6 }, { wch: 6 }, // E-F: Leader
    { wch: 6 }, { wch: 6 }, // G-H: Coach
    { wch: 6 }, { wch: 6 }, // I-J: Athlete
    { wch: 6 }, { wch: 6 }, // K-L: Subtotal M/F
    { wch: 6 }, // M: Subtotal combined
    { wch: 8 }, // N: Grand total
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ចុះចំនួន');
  return wb;
}

export function downloadRpt3Excel(input: Rpt3Input): void {
  const wb = generateRpt3Excel(input);
  XLSX.writeFile(wb, `RPT-3-ចុះចំនួន-${input.orgName}.xlsx`);
}
