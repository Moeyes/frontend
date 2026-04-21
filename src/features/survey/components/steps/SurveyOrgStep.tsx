'use client';

import React, { useEffect, useState } from 'react';
import { useSurvey } from '../../hooks';
import { fetchAllOrganizations } from '../../services';
import type { Organization } from '../../types';

export default function SurveyOrgStep() {
    const { form } = useSurvey();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadOrganizations = async () => {
            setIsLoading(true);
            try {
                const data = await fetchAllOrganizations();
                setOrganizations(data);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrganizations();
    }, []);

    const handleSelectOrganization = (org: Organization) => {
        form.setValue('organizationId', org.id);
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading organizations...</div>;
    }

    const organizationId = form.watch('organizationId');

    return (
        <div>
            <p className="text-sm text-slate-600 mb-6">
                Select your organization or province representative.
            </p>

            {organizations.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No organizations available</div>
            ) : (
                <div className="grid gap-4">
                    {organizations.map((org) => (
                        <button
                            key={org.id}
                            onClick={() => handleSelectOrganization(org)}
                            className={`p-4 text-left border rounded-lg transition-all ${organizationId === org.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <h3 className="font-semibold text-slate-900">{org.name_kh}</h3>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
