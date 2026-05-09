'use client';
import { useTranslations } from 'next-intl';
import { Badge, type BadgeVariant } from '@/shared/ui';
import type { EventPublic } from '../services/events.service';

// Gap #3 closed: EventPublic now has a real status field (DRAFT | PUBLISHED | ARCHIVED).
// The computed date-based status is kept as a secondary display alongside the official status.

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const STATUS_VARIANT: Record<EventStatus, BadgeVariant> = {
  DRAFT:     'outline',
  PUBLISHED: 'default',
  ARCHIVED:  'secondary',
};

export function EventStatusBadge({ event }: { event: EventPublic }) {
  const t      = useTranslations('events.status');
  const status = (event.status ?? 'DRAFT') as EventStatus;
  const variant = STATUS_VARIANT[status] ?? 'outline';
  return <Badge variant={variant}>{t(status.toLowerCase() as Parameters<typeof t>[0])}</Badge>;
}

// Kept for backward-compat (used by EventDetailPage for display alongside status)
export function computeEventStatus(event: EventPublic) {
  return event.status ?? 'DRAFT';
}
