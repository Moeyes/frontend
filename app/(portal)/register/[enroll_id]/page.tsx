import { ProtectedRoute } from '@/core/auth';
import { BackLink, PageHeader, QueryBoundary } from '@/shared/ui';
import { ROUTES } from '@/core/config';

// Placeholder — participant detail/edit page.
// Full implementation deferred to Week 5 Thu (participation module handles leader variant).
async function ParticipantDetailPlaceholder({ enrollId }: { enrollId: number }) {
  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.register.home} label="Back" />
      <PageHeader title={`Participant #${enrollId}`} />
      <p className="text-sm text-muted-foreground">
        Participant detail view — coming in the next session.
      </p>
    </div>
  );
}

interface Props { params: Promise<{ enroll_id: string }>; }

export default async function ParticipantDetailRoute({ params }: Props) {
  const { enroll_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['user1']}>
      <ParticipantDetailPlaceholder enrollId={Number(enroll_id)} />
    </ProtectedRoute>
  );
}
