'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PageHeader, PageShell } from '@/shared';
import { ParticipationForm } from './ParticipationForm';
import { ParticipationList } from './ParticipationList';

export function ParticipationPage() {
    const [showForm, setShowForm] = useState(false);

    return (
        <PageShell size="wide">
            <PageHeader
                title="Participation Management"
                description="Manage participation records across different sports"
                action={
                    <Button
                        onClick={() => setShowForm((value) => !value)}
                        variant={showForm ? 'outline' : 'default'}
                        className="gap-2"
                    >
                        {showForm ? (
                            <>
                                <X className="h-4 w-4" />
                                Close
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Record
                            </>
                        )}
                    </Button>
                }
            />

            {showForm && (
                <div className="max-w-2xl">
                    <ParticipationForm onSuccess={() => setShowForm(false)} />
                </div>
            )}

            <ParticipationList />
        </PageShell>
    );
}
