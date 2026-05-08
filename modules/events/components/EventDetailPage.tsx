'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { QueryBoundary, PageHeader, BackLink, Card, CardContent, Button } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useEvent } from '../hooks/useEvent';
import { EventStatusBadge } from './EventStatusBadge';
import { EventForm } from './EventForm';
import { EventSportManager } from './EventSportManager';
import type { EventPublic } from '../services/events.service';

interface EventDetailPageProps {
  eventId: number;
}

export function EventDetailPage({ eventId }: EventDetailPageProps) {
  const t           = useTranslations('events');
  const tc          = useTranslations('common');
  const { locale }  = useLanguage();
  const router      = useRouter();
  const [editing, setEditing] = useState(false);
  const query       = useEvent(eventId);

  const renderInfo = (event: EventPublic) => (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{event.name_kh}</h2>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
          </div>
          <EventStatusBadge event={event} />
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            { key: 'startDate',              val: formatDate(event.start_date, locale) },
            { key: 'endDate',                val: formatDate(event.end_date, locale) },
            { key: 'registrationOpenDate',   val: formatDate(event.open_register_date, locale) },
            { key: 'registrationCloseDate',  val: formatDate(event.close_register_date, locale) },
            { key: 'location',               val: event.location ?? t('notSet') },
          ].map(({ key, val }) => (
            <div key={key}>
              <dt className="text-muted-foreground">{t(key as Parameters<typeof t>[0])}</dt>
              <dd className="font-medium">{val}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            {tc('edit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <BackLink href={ROUTES.events.list} label={t('backToEvents')} />
      <PageHeader title={t('detailTitle')} />

      <QueryBoundary query={query}>
        {(event) => (
          <>
            {editing ? (
              <Card>
                <CardContent className="pt-5">
                  <EventForm
                    mode="edit"
                    event={event}
                    onSuccess={() => setEditing(false)}
                  />
                </CardContent>
              </Card>
            ) : (
              renderInfo(event)
            )}

            <EventSportManager eventId={eventId} />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
