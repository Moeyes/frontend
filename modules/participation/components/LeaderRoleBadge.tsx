'use client';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui';
import type { LeaderRole } from '@/modules/registration-flow';

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  coach:             'default',
  manager:           'secondary',
  delegate:          'secondary',
  team_lead:         'default',
  coach_trainer:     'outline',
  teacher_assistant: 'outline',
};

export function LeaderRoleBadge({ role }: { role: LeaderRole | string | null | undefined }) {
  const t = useTranslations('participation.leaderRoles');
  if (!role) return null;
  const label = (['coach','manager','delegate','team_lead','coach_trainer','teacher_assistant'] as const)
    .includes(role as LeaderRole)
    ? t(role as LeaderRole)
    : role;
  return <Badge variant={ROLE_VARIANT[role] ?? 'outline'}>{label}</Badge>;
}
