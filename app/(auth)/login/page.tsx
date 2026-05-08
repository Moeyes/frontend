import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginPage } from '@/modules/auth';
import { ROUTES } from '@/core/config';

export default async function LoginRoute() {
  const cookieStore = await cookies();
  if (cookieStore.get('access_token')) {
    redirect(ROUTES.dashboard);
  }
  return <LoginPage />;
}
