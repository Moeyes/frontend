'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackLinkProps {
  label?: string;
  href?: string;
  className?: string;
}

export function BackLink({ label, href, className }: BackLinkProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const resolvedLabel = label ?? t('back');

  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className={cn(
        'flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4',
        className
      )}
    >
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      {resolvedLabel}
    </button>
  );
}
