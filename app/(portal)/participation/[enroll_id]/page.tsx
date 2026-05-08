import { ProtectedRoute } from '@/core/auth';
import { BackLink, PageHeader } from '@/shared/ui';
import { ROUTES } from '@/core/config';

// Placeholder — organizer detail/edit.
async function OrganizerDetailPlaceholder({ enrollId }: { enrollId: number }) {
  return (
    <div className="space-y-4">
      <BackLink href={ROUTES.participation.home} label="Back" />
      <PageHeader title={`Organizer #${enrollId}`} />
      <p className="text-sm text-muted-foreground">
        Organizer detail — edit functionality coming in the next session.
      </p>
    </div>
  );
}

interface Props { params: Promise<{ enroll_id: string }>; }

export default async function OrganizerDetailRoute({ params }: Props) {
  const { enroll_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['user2']}>
      <OrganizerDetailPlaceholder enrollId={Number(enroll_id)} />
    </ProtectedRoute>
  );
}
