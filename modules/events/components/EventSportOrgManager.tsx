'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Badge, Skeleton, PageEmptyState, Modal } from '@/shared/ui';
import { useEventSportOrgs, useAllOrgsCatalogue } from '../hooks/useEventSportOrgs';
import { useAddOrgToEventSport } from '../hooks/useAddOrgToEventSport';
import { useRemoveOrgFromEventSport } from '../hooks/useRemoveOrgFromEventSport';

interface EventSportOrgManagerProps {
  eventId: number;
  sportId: number;
  sportName: string;
}

export function EventSportOrgManager({ eventId, sportId, sportName }: EventSportOrgManagerProps) {
  const t  = useTranslations('events');
  const tc = useTranslations('common');
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [removeId, setRemoveId] = useState<number | null>(null);

  const orgsQuery   = useEventSportOrgs(eventId, sportId);
  const catalogueQ  = useAllOrgsCatalogue();
  const addMutation = useAddOrgToEventSport(eventId, sportId);
  const removeMutation = useRemoveOrgFromEventSport(eventId, sportId);

  const linkedIds = new Set(orgsQuery.data?.map((o) => o.organization_id) ?? []);
  const available = (catalogueQ.data ?? []).filter((o) => !linkedIds.has(o.id));

  const handleAdd = () => {
    if (!selectedOrgId) return;
    addMutation.mutate(
      { events_id: eventId, sports_id: sportId, org_id: selectedOrgId },
      { onSuccess: () => setSelectedOrgId(null) }
    );
  };

  if (orgsQuery.isLoading) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  return (
    <div className="mt-3 space-y-2 pl-2 border-l-2 border-muted">
      <p className="text-xs font-medium text-muted-foreground">
        {t('orgs.title', { sportName })}
      </p>

      {(orgsQuery.data ?? []).length === 0 ? (
        <PageEmptyState message={t('orgs.noOrgsAssigned')} />
      ) : (
        <ul className="space-y-1">
          {(orgsQuery.data ?? []).map((org) => {
            const orgName = catalogueQ.data?.find((o) => o.id === org.organization_id)?.name_kh
              ?? `Org #${org.organization_id}`;
            return (
              <li key={org.id} className="flex items-center justify-between gap-2 text-sm">
                <Badge variant="outline">{orgName}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-6 px-2"
                  onClick={() => setRemoveId(org.id)}
                  aria-label={tc('delete')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add org picker */}
      {available.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <select
            className="text-xs border rounded px-2 py-1 flex-1 bg-background"
            value={selectedOrgId ?? ''}
            onChange={(e) => setSelectedOrgId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('orgs.selectOrg')}</option>
            {available.map((o) => (
              <option key={o.id} value={o.id}>{o.name_kh}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedOrgId || addMutation.isPending}
            loading={addMutation.isPending}
            onClick={handleAdd}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Modal
        open={!!removeId}
        onOpenChange={(o) => { if (!o) setRemoveId(null); }}
        title={tc('confirm')}
        description={t('orgs.removeOrgConfirm')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRemoveId(null)}>{tc('cancel')}</Button>
            <Button
              variant="destructive"
              loading={removeMutation.isPending}
              onClick={() => removeId && removeMutation.mutate(removeId, { onSettled: () => setRemoveId(null) })}
            >
              {tc('delete')}
            </Button>
          </div>
        }
      >
        <span />
      </Modal>
    </div>
  );
}
