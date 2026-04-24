'use client';

import { Layers } from 'lucide-react';
import { ContentPanel, PageEmptyState, PageHeader, PageShell } from '@/shared';

export function ByCategoryPage() {
    return (
        <PageShell size="wide">
            <PageHeader
                title="By Category"
                description="View and search registrations organized by category"
                icon={Layers}
            />

            <ContentPanel>
                <PageEmptyState
                    title="Coming soon..."
                    description="Category-based registration tools will live here."
                    className="border-0 p-12 shadow-none"
                />
            </ContentPanel>
        </PageShell>
    );
}
