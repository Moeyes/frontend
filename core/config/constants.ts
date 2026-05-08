export const APP_NAME_KH = 'ប្រព័ន្ធគ្រប់គ្រងព្រឹត្តិការណ៍កីឡាជាតិ';
export const APP_NAME_EN = 'National Sports Event Management';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const SUPPORTED_LOCALES = ['kh', 'en'] as const;
export const DEFAULT_LOCALE = 'kh' as const;

export const CLOUDINARY_UPLOAD_ENDPOINT = 'https://api.cloudinary.com/v1_1';

export const REGISTRATION_STEPS = ['personal', 'sport', 'documents', 'review'] as const;

// Age boundary for document rules (Red Line #3 — computed from event date)
export const MINOR_AGE_THRESHOLD = 18;
