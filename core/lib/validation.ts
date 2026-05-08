import { z } from 'zod';

// Cambodian phone: 0XX-XXX-XXX or +855-XX-XXX-XXX
export const phoneSchema = z
  .string()
  .regex(/^(\+855|0)[0-9]{8,9}$/, { message: 'validation.phone.invalid' });

export const emailSchema = z
  .string()
  .email({ message: 'validation.email.invalid' });

// Cambodian National ID: 9 digits
export const nationalIdSchema = z
  .string()
  .regex(/^[0-9]{9}$/, { message: 'validation.nationalId.invalid' });

// Passport: 1-2 uppercase letters + 6-7 digits
export const passportSchema = z
  .string()
  .regex(/^[A-Z]{1,2}[0-9]{6,7}$/, { message: 'validation.passport.invalid' });

export const dobSchema = z.string().refine(
  (val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d < new Date();
  },
  { message: 'validation.dob.invalid' }
);

export const positiveIntSchema = z
  .number()
  .int()
  .min(0, { message: 'validation.count.negative' });
