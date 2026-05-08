import { ProtectedRoute } from '@/core/auth';
import { OrganizationDetailPage } from '@/modules/organizations';

interface Props {
  params: Promise<{ org_id: string }>;
}

export default async function OrganizationDetailRoute({ params }: Props) {
  const { org_id } = await params;
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <OrganizationDetailPage orgId={Number(org_id)} />
    </ProtectedRoute>
  );
}
