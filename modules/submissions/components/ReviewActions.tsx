'use client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Flag } from 'lucide-react';
import { Button, Badge, type BadgeVariant } from '@/shared/ui';
import { useApproveSubmission } from '../hooks/useApproveSubmission';
import { useRejectSubmission }  from '../hooks/useRejectSubmission';
import { useFlagSubmission }    from '../hooks/useFlagSubmission';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PENDING:   'outline',
  SUBMITTED: 'secondary',
  APPROVED:  'default',
  REJECTED:  'destructive',
  FLAGGED:   'outline',
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const t = useTranslations('submissions');
  const s = status ?? 'PENDING';
  return (
    <Badge variant={STATUS_VARIANT[s] ?? 'outline'}>
      {t(`status.${s.toLowerCase()}` as Parameters<typeof t>[0])}
    </Badge>
  );
}

interface ReviewActionsProps {
  submissionId: number;
  currentStatus?: string | null;
}

export function ReviewActions({ submissionId, currentStatus }: ReviewActionsProps) {
  const t = useTranslations('submissions');

  const approve = useApproveSubmission(submissionId);
  const reject  = useRejectSubmission(submissionId);
  const flag    = useFlagSubmission(submissionId);

  const isPending = approve.isPending || reject.isPending || flag.isPending;

  const handle = (
    mutation: typeof approve,
    successKey: Parameters<typeof t>[0],
  ) => {
    mutation.mutate(undefined, {
      onSuccess: () => toast.success(t(successKey)),
      onError:   () => toast.error(t('actionFailed')),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{t('currentStatus')}</span>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || currentStatus === 'APPROVED'}
          loading={approve.isPending}
          onClick={() => handle(approve, 'approveSuccess')}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
          {t('approve')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || currentStatus === 'REJECTED'}
          loading={reject.isPending}
          onClick={() => handle(reject, 'rejectSuccess')}
          className="gap-2"
        >
          <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
          {t('reject')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || currentStatus === 'FLAGGED'}
          loading={flag.isPending}
          onClick={() => handle(flag, 'flagSuccess')}
          className="gap-2"
        >
          <Flag className="h-4 w-4 text-orange-500" aria-hidden="true" />
          {t('flag')}
        </Button>
      </div>
    </div>
  );
}
