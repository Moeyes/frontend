'use client';
import { useTranslations } from 'next-intl';
import { Badge, type BadgeVariant } from '@/shared/ui';
import type { EventPublic } from '../services/events.service';

type EventStatus = 'upcoming' | 'active' | 'ended' | 'unknown';

export function computeEventStatus(event: EventPublic): EventStatus {
  if (!event.start_date) return 'unknown';
  const now   = new Date();
  const start = new Date(event.start_date);
  const end   = event.end_date ? new Date(event.end_date) : null;
  if (now < start) return 'upcoming';
  if (!end || now <= end) return 'active';
  return 'ended';
}

const STATUS_VARIANT: Record<EventStatus, BadgeVariant> = {
  upcoming: 'secondary',
  active:   'default',
  ended:    'outline',
  unknown:  'outline',
};

export function EventStatusBadge({ event }: { event: EventPublic }) {
  const t      = useTranslations('events.status');
  const status = computeEventStatus(event);
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
