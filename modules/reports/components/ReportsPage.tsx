'use client';

import { FileSpreadsheet } from 'lucide-react';
import { PageHeader, PageShell } from '@/shared';
import { ReportList } from './ReportList';

export function ReportsPage() {
    return (
        <PageShell size="narrow">
            <PageHeader
                title="Excel Reports"
                description="Export registration data and summaries to Excel files"
                icon={FileSpreadsheet}
            />
            <ReportList />
        </PageShell>
    );
}
