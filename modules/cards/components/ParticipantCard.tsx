'use client';
import { useTranslations } from 'next-intl';
import { User2 } from 'lucide-react';
import { Badge } from '@/shared/ui';
import type { CardResponse } from '../services/cards.service';

interface ParticipantCardProps {
  card: CardResponse;
}

const CARD_TYPE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  F: 'default',   // Federation
  O: 'secondary', // Organization
  A: 'outline',   // Athlete
};

export function ParticipantCard({ card }: ParticipantCardProps) {
  const t = useTranslations('cards');

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Photo area */}
      <div className="relative h-36 bg-muted flex items-center justify-center">
        {card.profile_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.profile_image}
            alt={card.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <User2 className="h-16 w-16 text-muted-foreground/40" aria-label={t('noPhoto')} />
        )}
        {/* Card type badge pinned top-right */}
        <div className="absolute top-2 right-2">
          <Badge variant={CARD_TYPE_VARIANT[card.card_type] ?? 'outline'} className="text-xs">
            {card.card_type}
          </Badge>
        </div>
      </div>

      {/* Card info */}
      <div className="p-3 space-y-1 flex-1">
        <p className="font-semibold text-sm leading-tight truncate" title={card.name}>
          {card.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{card.org_name}</p>
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{card.sport}</span>
          <span className="text-xs text-muted-foreground">{card.role}</span>
          <span className="text-xs text-muted-foreground">{card.gender}</span>
        </div>
      </div>
    </div>
  );
}
