import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, { message: 'auth.usernameRequired' }),
  password: z.string().min(1, { message: 'auth.passwordRequired' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
