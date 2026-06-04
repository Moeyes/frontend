'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/utils/cn';
import type { ByNumberFormInput, ByNumberFormData, Organization } from '../types';

interface ByNumberOrganizationStepProps {
    form: UseFormReturn<ByNumberFormInput, unknown, ByNumberFormData>;
    organizations: Organization[];
}

const selectableCard = (selected: boolean) =>
    cn(
        'rounded-lg border p-4 text-left leading-relaxed transition-all',
        selected
            ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
            : 'border-border hover:border-primary/40 hover:bg-accent/40',
    );

export function ByNumberOrganizationStep({ form, organizations }: ByNumberOrganizationStepProps) {
    const { watch, setValue, trigger } = form;
    const t = useTranslations('bynumber');
    const selectedOrgId = watch('organizationId');

    if (organizations.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm leading-relaxed text-muted-foreground">
                {t('noOrgs')}
            </div>
        );
    }

    return (
        <div className="grid max-h-[400px] gap-3 overflow-y-auto pr-2">
            {organizations.map((org) => (
                <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                        setValue('organizationId', org.id);
                        trigger('organizationId');
                    }}
                    className={selectableCard(selectedOrgId === org.id)}
                >
                    <h4 className="font-medium leading-relaxed text-foreground">{org.name_kh}</h4>
                    {org.type && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{org.type}</p>
                    )}
                </button>
            ))}
        </div>
    );
}
