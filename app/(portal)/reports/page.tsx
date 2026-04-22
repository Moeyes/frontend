/**
 * Reports Page
 */

'use client';

import { ReportList } from '@/features/reports/components/ReportList';
import { useRequireRole } from '@/features/auth/hooks';
import { UserRole } from '@/features/auth/types';
import { FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
    useRequireRole([UserRole.ADMIN, UserRole.ORGANIZATION]);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Excel Reports</h1>
                        <p className="text-muted-foreground mt-1">Export registration data and summaries to Excel files</p>
                    </div>
                </div>

                <ReportList />
            </div>
        </div>
    );
}
