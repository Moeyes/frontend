import { redirect } from 'next/navigation';

// Root redirects to /login until auth is wired in Prompt 5 (foundation layer).
// Auth context will replace this with a role-aware redirect to /dashboard.
export default function RootPage() {
  redirect('/login');
}
