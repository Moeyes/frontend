/**
 * By Sport Page
 * 
 * View and manage registrations by sport
 * Protected: Organization, Admin only
 */

'use client';

import { useRequireRole } from '@/features/auth/hooks';
import { UserRole } from '@/features/auth/types';
import { SurveyForm } from '@/features/survey';

export default function BySportPage() {
    useRequireRole([UserRole.ORGANIZATION, UserRole.ADMIN]);

    return (
        <main className="min-h-screen bg-background">
            <SurveyForm />
        </main>

        
    );
}
