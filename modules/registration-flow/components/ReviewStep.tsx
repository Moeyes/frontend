'use client';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import type { EventSportStepValues, PersonalInfoStepValues, DocumentStepValues } from '../services/schema';

interface ReviewStepProps {
  eventSport:   EventSportStepValues;
  personalInfo: PersonalInfoStepValues;
  documents:    DocumentStepValues;
  isPending:    boolean;
  onSubmit:     () => void;
  onBack:       () => void;
}

export function ReviewStep({
  eventSport, personalInfo, documents, isPending, onSubmit, onBack,
}: ReviewStepProps) {
  const t       = useTranslations('registration');
  const tc      = useTranslations('common');
  const { locale } = useLanguage();

  const docCount = [
    documents.photoUrl,
    documents.birthCertificateUrl,
    documents.nationalIdUrl,
    documents.passportUrl,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-5 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            {t('review.eventDetails')}
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Event ID</dt>
              <dd className="font-medium">#{eventSport.event_id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Sport ID</dt>
              <dd className="font-medium">#{eventSport.sport_id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('fields.role')}</dt>
              <dd className="font-medium">
                {eventSport.role === 'athlete' ? t('roles.athlete') : t('roles.leader')}
                {eventSport.leader_role && ` — ${t(`leaderRoles.${eventSport.leader_role}` as Parameters<typeof t>[0])}`}
              </dd>
            </div>
          </dl>

          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">
            {t('review.personalInfo')}
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('review.khmerName')}</dt>
              <dd className="font-medium">{personalInfo.kh_family_name} {personalInfo.kh_given_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('review.englishName')}</dt>
              <dd className="font-medium">{personalInfo.en_family_name} {personalInfo.en_given_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('review.gender')}</dt>
              <dd className="font-medium">{personalInfo.gender === 'MALE' ? tc('male') : tc('female')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('fields.dateOfBirth')}</dt>
              <dd className="font-medium tabular-nums">{formatDate(personalInfo.date_of_birth, locale)}</dd>
            </div>
            {personalInfo.phone && (
              <div>
                <dt className="text-muted-foreground">{t('review.phone')}</dt>
                <dd className="font-medium">{personalInfo.phone}</dd>
              </div>
            )}
          </dl>

          {docCount > 0 && (
            <div className="text-sm text-muted-foreground pt-2">
              {t('fields.fileUploaded')} ×{docCount}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
          ← {tc('back')}
        </Button>
        <Button onClick={onSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t('success.title').split('!')[0]}
        </Button>
      </div>
    </div>
  );
}
