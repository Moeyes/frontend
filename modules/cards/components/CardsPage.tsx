'use client';

import { CreditCard } from 'lucide-react';
import { CardGrid } from './CardGrid';
import { PageHeader, PageShell } from '@/shared';

export function CardsPage() {
    return (
        <PageShell padded={false} size="wide">
            <PageHeader
                title="Participant Cards"
                description="Generate and manage participant cards for National Primary School Games 2026."
                icon={CreditCard}
            />
            <CardGrid />
        </PageShell>
    );
}
