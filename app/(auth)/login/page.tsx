/**
 * Login Page
 * 
 * User authentication page
 */

import { LoginForm } from '@/features/auth/components';

export const metadata = {
  title: 'Login - Choschmous',
  description: 'Sign in to your sports event account',
};

export default function LoginPage() {
  return <LoginForm />;
}
