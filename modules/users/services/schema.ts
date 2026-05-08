import { z } from 'zod';

const roleEnum = z.enum(['admin', 'user1', 'user2', 'guest']);

const baseUserSchema = z.object({
  kh_family_name: z.string().min(1, { message: 'users.validation.khFamilyNameRequired' }),
  kh_given_name:  z.string().min(1, { message: 'users.validation.khGivenNameRequired' }),
  en_family_name: z.string().min(1, { message: 'users.validation.enFamilyNameRequired' }),
  en_given_name:  z.string().min(1, { message: 'users.validation.enGivenNameRequired' }),
  email:    z.string().email({ message: 'users.validation.emailInvalid' }),
  username: z.string().min(2, { message: 'users.validation.usernameRequired' }),
  role: roleEnum.optional().nullable(),
  is_active: z.boolean().default(true),
});

export const userCreateSchema = baseUserSchema.extend({
  password: z.string().min(6, { message: 'users.validation.passwordTooShort' }),
});

export const userEditSchema = baseUserSchema.extend({
  // Empty string = "don't change"; validated min(6) only when non-empty
  password: z.union([
    z.string().min(6, { message: 'users.validation.passwordTooShort' }),
    z.literal(''),
  ]).optional(),
});

export type UserCreateFormValues = z.infer<typeof userCreateSchema>;
export type UserEditFormValues   = z.infer<typeof userEditSchema>;
