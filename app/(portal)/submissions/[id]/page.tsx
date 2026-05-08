import { ProtectedRoute } from '@/core/auth';
import { SubmissionDetail } from '@/modules/submissions';

interface Props { params: Promise<{ id: string }>; }

export default async function SubmissionDetailRoute({ params }: Props) {
  const { id } = await params;
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <SubmissionDetail submissionId={Number(id)} />
    </ProtectedRoute>
  );
}
