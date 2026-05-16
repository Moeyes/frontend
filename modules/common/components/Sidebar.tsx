'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  CalendarDays,
  Medal,
  Building2,
  Users,
  ClipboardList,
  CheckSquare,
  UserPlus,
  Users2,
  FileBarChart,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/core/auth';
import type { UserRole } from '@/core/auth';
import { ROUTES } from '@/core/config';

type NavKey =
  | 'dashboard'
  | 'events'
  | 'sports'
  | 'organizations'
  | 'users'
  | 'surveys'
  | 'submissions'
  | 'registration'
  | 'participation'
  | 'reports'
  | 'cards';

interface NavItem {
  labelKey: NavKey;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'dashboard',    href: ROUTES.dashboard,           icon: LayoutDashboard, roles: ['admin', 'user1', 'user2', 'guest'] },
  { labelKey: 'events',       href: ROUTES.events.list,         icon: CalendarDays,    roles: ['admin'] },
  { labelKey: 'sports',       href: ROUTES.sports.list,         icon: Medal,           roles: ['admin'] },
  { labelKey: 'organizations',href: ROUTES.organizations.list,  icon: Building2,       roles: ['admin'] },
  { labelKey: 'users',        href: ROUTES.users.list,          icon: Users,           roles: ['admin'] },
  { labelKey: 'surveys',      href: ROUTES.surveys.home,        icon: ClipboardList,   roles: ['user1', 'user2'] },
  { labelKey: 'submissions',  href: ROUTES.submissions.list,    icon: CheckSquare,     roles: ['admin'] },
  { labelKey: 'registration', href: ROUTES.register.home,       icon: UserPlus,        roles: ['user2'] },
  { labelKey: 'participation',href: ROUTES.participation.home,  icon: Users2,          roles: ['user1', 'user2'] },
  { labelKey: 'reports',      href: ROUTES.reports,             icon: FileBarChart,    roles: ['admin'] },
  { labelKey: 'cards',        href: ROUTES.cards,               icon: CreditCard,      roles: ['admin', 'user1', 'user2'] },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations('nav');

  const visible = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        'w-56 flex-shrink-0 border-r bg-card flex flex-col h-full z-30',
        // On mobile: slide in from left as fixed overlay; on lg+: always visible static
        'fixed inset-y-0 left-0 transition-transform duration-200 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="px-4 py-5 border-b flex items-center justify-between">
        <span className="text-sm font-semibold leading-tight text-foreground">
          {t('appName')}
        </span>
        {/* Close button visible only on mobile */}
        <button
          className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Main navigation">
        {visible.map((item) => {
          const isActive =
            item.href === ROUTES.dashboard
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
