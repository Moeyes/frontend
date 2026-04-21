/**
 * By Category Page
 * 
 * View and manage registrations by category
 * Protected: Federation, Admin only
 */

'use client';

import { useRequireRole } from '@/features/auth/hooks';
import { UserRole } from '@/features/auth/types';

export default function ByCategoryPage() {
    useRequireRole([UserRole.FEDERATION, UserRole.ADMIN]);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8">By Category</h1>

                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-muted-foreground">
                        View and search registrations organized by category
                    </p>
                    <div className="mt-6 p-12 border-2 border-dashed border-border rounded-lg">
                        <p className="text-center text-muted-foreground">
                            Coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
