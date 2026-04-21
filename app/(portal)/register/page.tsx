/**
 * Register Page
 * 
 * Public registration form page for new participants
 */

import { RegisterForm } from '@/features/registration';

export const metadata = {
  title: 'Register - Choschmous',
  description: 'Register for sports events',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background">
      <RegisterForm />
    </main>
  );
}
