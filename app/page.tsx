import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/core/config';

// Smart redirect: authenticated users go to dashboard, unauthenticated to login.
export default async function RootPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('access_token')) {
    redirect(ROUTES.dashboard);
  }
  redirect(ROUTES.login);
}
