export interface LeaderRow {
  name: string;
  gender: string;
  date_of_birth: string | null;
  role: string;
  other: string | null;
}

export interface AthleteRow {
  name: string;
  gender: string;
  date_of_birth: string | null;
  role: string;
  other: string | null;
}

export interface PdfDataResponse {
  event_name: string;
  org_name: string;
  sport_name: string;
  leaders: LeaderRow[];
  athletes_male: AthleteRow[];
  athletes_female: AthleteRow[];
}

export interface Event {
  id: number;
  name_kh: string;
  event_type_id: number;
  is_active: boolean;
}

export interface Organization {
  id: number;
  name_kh: string;
  type?: string;
}

export interface Sport {
  id: number;
  name_kh: string;
}
