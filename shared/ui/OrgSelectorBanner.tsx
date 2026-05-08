'use client';
import { useTranslations } from 'next-intl';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useOrganizations } from '@/modules/organizations';
import { useOrgOverride } from '@/core/auth';

interface OrgSelectorBannerProps {
  onOrgSelected?: (orgId: number) => void;
}

// Shown when auth.user.organization_id is null (backend gap: UserPublic missing field).
// Lets federation/org users self-select their organization; persisted in a plain cookie.
export function OrgSelectorBanner({ onOrgSelected }: OrgSelectorBannerProps) {
  const t = useTranslations('common');
  const { overrideOrgId, setOrg } = useOrgOverride();
  const orgsQuery = useOrganizations({ limit: 200 });

  if (overrideOrgId) {
    const orgName = orgsQuery.data?.data.find((o) => o.id === overrideOrgId)?.name_kh;
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-400 bg-green-50 px-4 py-2 text-sm text-green-800">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1">
          {orgName ?? `Org #${overrideOrgId}`}
        </span>
        <button
          onClick={() => setOrg(null)}
          className="text-xs underline text-green-700 hover:text-green-900"
        >
          {t('edit')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-2">
        <p className="font-medium">
          {t('selectOrganizationRequired')}
        </p>
        <select
          className="w-full rounded-md border border-yellow-400 bg-white px-3 py-1.5 text-sm text-foreground"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              const id = Number(e.target.value);
              setOrg(id);
              onOrgSelected?.(id);
            }
          }}
        >
          <option value="">{t('selectOrganization')}</option>
          {(orgsQuery.data?.data ?? []).map((org) => (
            <option key={org.id} value={org.id}>{org.name_kh}</option>
          ))}
        </select>
        <p className="text-xs text-yellow-700">{t('orgIdMissingExplain')}</p>
      </div>
    </div>
  );
}
