'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button } from '@/shared/ui';
import { useAuth } from '@/core/auth';
import type { UserRole } from '@/core/auth';
import { ROUTES } from '@/core/config';

interface UserWelcomeProps {
  role: UserRole;
}

export function UserWelcome({ role }: UserWelcomeProps) {
  const { user } = useAuth();
  const tDash = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const name = user ? `${user.kh_family_name} ${user.kh_given_name}` : '';

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card>
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            {tDash('welcomeBack', { name })}
          </h1>

          {role === 'user1' && (
            <>
              <p className="text-sm text-muted-foreground">
                {tDash('federationWelcome.subtitle')}
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button asChild>
                  <Link href={ROUTES.surveys.home}>
                    {tDash('federationWelcome.goToSurveys')}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={ROUTES.register.home}>
                    {tDash('federationWelcome.goToRegister')}
                  </Link>
                </Button>
              </div>
            </>
          )}

          {role === 'user2' && (
            <>
              <p className="text-sm text-muted-foreground">
                {tDash('orgWelcome.subtitle')}
              </p>
              <Button asChild>
                <Link href={ROUTES.participation.home}>
                  {tDash('orgWelcome.goToParticipation')}
                </Link>
              </Button>
            </>
          )}

          {role === 'guest' && (
            <p className="text-sm text-muted-foreground">{tCommon('comingSoon')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
