/**
 * Register Page
 * 
 * Registration form page with global theme styling
 */

import { RegisterForm } from '@/features/auth';

/**
 * Registration page component
 */
export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-background">
            <RegisterForm />
        </main>
    );
}
