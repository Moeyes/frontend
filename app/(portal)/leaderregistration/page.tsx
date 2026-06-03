'use client';

import { useRequireRole, FEATURE_ACCESS } from '@/core/auth';
import { RegisterForm } from '@/modules/registration';

export default function Page() {
  useRequireRole(FEATURE_ACCESS.leaderregistration);
  return <RegisterForm mode="leader" />;
}
