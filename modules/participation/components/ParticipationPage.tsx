'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PageHeader, PageShell } from '@/shared';
import { ParticipationForm } from './ParticipationForm';
import { ParticipationList } from './ParticipationList';
import { useTranslations } from 'next-intl';

export function ParticipationPage() {
    const [showForm, setShowForm] = useState(false);
    const t = useTranslations('participation');

    return (
        <PageShell size="wide">
            <PageHeader
                title={t('title')} description={t('description')}
                action={
                    <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'default'} className="gap-2">
                        {showForm ? <><X className="h-4 w-4" />{t('records.title')}</> : <><Plus className="h-4 w-4" />{t('addRecord')}</>}
                    </Button>
                }
            />
            {showForm && <div className="max-w-2xl"><ParticipationForm onSuccess={() => setShowForm(false)} /></div>}
            <ParticipationList />
        </PageShell>
    );
}
