import * as XLSX from 'xlsx';
import {
  HEADER_LINE1, HEADER_LINE2, HEADER_LINE4, HEADER_LINE5,
  FOOTER_SEEN_LINE, FOOTER_PROVINCE_LINE, FOOTER_LEFT_TITLE, FOOTER_RIGHT_TITLE,
} from './khmer-header';

// RPT-5 column layout (11 columns: A-K)
// A=No, B=Full name(Khmer), C=Gender, D=Day, E=Month, F=Year, G=Nationality,
// H=ID#, I=Role, J=Sport, K=Notes

const RPT5_TITLE = 'បញ្ជីរាយនាមប្រតិភូ គ្រូបង្វឹក កីឡាករ កីឡាការិនីគ្រប់ប្រភេទកីឡា';

export interface Rpt5PersonRow {
  no: number;
  full_name_kh:  string;
  gender:        string;
  dob_day:       string;
  dob_month:     string;
  dob_year:      string;
  nationality:   string;
  id_number:     string;
  role:          string;
  sport_name:    string;
  notes:         string;
}

export interface Rpt5Input {
  orgName:   string;
  eventName: string;
  people:    Rpt5PersonRow[];
}

const N_COLS = 11;

export function generateRpt5Excel(input: Rpt5Input): XLSX.WorkBook {
  const ws: XLSX.WorkSheet = {};
  const merges: XLSX.Range[] = [];

  const set = (r: number, c: number, v: string | number) => {
    const addr = XLSX.utils.encode_cell({ r: r - 1, c: c - 1 });
    ws[addr] = typeof v === 'string' ? { t: 's', v } : { t: 'n', v };
  };

  const merge = (r1: number, c1: number, r2: number, c2: number) => {
    merges.push({ s: { r: r1 - 1, c: c1 - 1 }, e: { r: r2 - 1, c: c2 - 1 } });
  };

  // ── Rows 1-8: Ministry header band ──
  set(1, 1, HEADER_LINE1);  merge(1, 1, 1, N_COLS);
  set(2, 1, HEADER_LINE2);  merge(2, 1, 2, N_COLS);
  merge(3, 1, 3, N_COLS);
  set(4, 1, HEADER_LINE4);  merge(4, 1, 4, N_COLS);
  set(5, 1, HEADER_LINE5);  merge(5, 1, 5, N_COLS);
  set(6, 1, RPT5_TITLE);    merge(6, 1, 6, N_COLS);
  set(7, 1, input.orgName);  merge(7, 1, 7, N_COLS);
  set(8, 1, input.eventName); merge(8, 1, 8, N_COLS);

  // ── Row 9: Column headers ──
  const HEADERS = [
    'ល.រ', 'គោត្តនាម-នាម', 'ភេទ', 'ថ្ងៃ', 'ខែ', 'ឆ្នាំកំណើត',
    'សញ្ជាតិ', 'អត្តសញ្ញាណប័ណ្ណ', 'តួនាទី', 'ប្រភេទកីឡា', 'ផ្សេងៗ',
  ];
  HEADERS.forEach((h, i) => set(9, i + 1, h));

  // ── Rows 10+: Person data ──
  const DATA_START = 10;
  input.people.forEach((person, idx) => {
    const r = DATA_START + idx;
    set(r, 1, person.no);
    set(r, 2, person.full_name_kh);
    set(r, 3, person.gender);
    set(r, 4, person.dob_day);
    set(r, 5, person.dob_month);
    set(r, 6, person.dob_year);
    set(r, 7, person.nationality);
    set(r, 8, person.id_number);
    set(r, 9, person.role);
    set(r, 10, person.sport_name);
    set(r, 11, person.notes);
  });

  // ── Footer ──
  const F1 = DATA_START + input.people.length + 2;
  const F2 = F1 + 1;
  const F3 = F2 + 1;
  set(F1, 5, 'ថ្ងៃ............ខែ............ឆ្នាំ.........'); merge(F1, 5, F1, N_COLS);
  set(F2, 1, FOOTER_SEEN_LINE);   merge(F2, 1, F2, 4);
  set(F2, 5, FOOTER_PROVINCE_LINE); merge(F2, 5, F2, N_COLS);
  set(F3, 1, FOOTER_LEFT_TITLE);  merge(F3, 1, F3, 4);
  set(F3, 5, FOOTER_RIGHT_TITLE); merge(F3, 5, F3, N_COLS);

  const lastRow = F3 + 1;
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: N_COLS - 1 } });
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 5 }, { wch: 28 }, { wch: 5 },
    { wch: 5 }, { wch: 5 }, { wch: 8 },
    { wch: 10 }, { wch: 16 }, { wch: 20 },
    { wch: 18 }, { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'រាយនាមរួម');
  return wb;
}

export function downloadRpt5Excel(input: Rpt5Input): void {
  const wb = generateRpt5Excel(input);
  XLSX.writeFile(wb, `RPT-5-រាយនាមរួម-${input.orgName}.xlsx`);
}
