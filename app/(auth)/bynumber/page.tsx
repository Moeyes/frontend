/**
 * ByNumber Page
 * 
 * Organization registration with participant counts form
 */

import { ByNumberForm } from '@/features/bynumber';

/**
 * ByNumber page component
 */
export default function ByNumberPage() {
    return (
        <main className="min-h-screen bg-background">
            <ByNumberForm />
        </main>
    );
}