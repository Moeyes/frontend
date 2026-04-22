'use client';

import { OrgList } from '@/features/organizations';

/**
 * Organizations Management Page
 */
export default function OrganizationsPage() {
    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OrgList />
        </div>
    );
}
