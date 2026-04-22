/**
 * Participation Page
 */

'use client';

import { ParticipationList, ParticipationForm } from '@/features/participation-per-sport';
import { useRequireRole } from '@/features/auth/hooks';
import { UserRole } from '@/features/auth/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export default function ParticipationPage() {
    useRequireRole([UserRole.ADMIN, UserRole.ORGANIZATION]);
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Participation Management</h1>
                        <p className="text-muted-foreground mt-1">Manage participation records across different sports</p>
                    </div>
                    <Button 
                        onClick={() => setShowForm(!showForm)} 
                        variant={showForm ? 'outline' : 'default'}
                        className="gap-2"
                    >
                        {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add Record</>}
                    </Button>
                </div>

                {showForm && (
                    <div className="max-w-2xl">
                        <ParticipationForm onSuccess={() => setShowForm(false)} />
                    </div>
                )}

                <ParticipationList />
            </div>
        </div>
    );
}
