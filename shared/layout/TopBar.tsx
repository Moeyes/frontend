'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronRight, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth, UserRole } from '@/core/auth';
import { Button, LanguageSwitcher } from '@/shared/ui';

const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'superAdmin',
    [UserRole.ADMIN]: 'admin',
    [UserRole.ORGANIZATION]: 'organization',
    [UserRole.FEDERATION]: 'federation',
    [UserRole.GUEST]: 'guest',
};

const BREADCRUMB_MAP: Array<{ href: string; labelKey: string }> = [
    { href: '/dashboard', labelKey: 'dashboard' },
    { href: '/events', labelKey: 'events' },
    { href: '/sports', labelKey: 'sports' },
    { href: '/organizations', labelKey: 'organizations' },
    { href: '/users', labelKey: 'users' },
    { href: '/register', labelKey: 'athleteRegistration' },
    { href: '/bysport', labelKey: 'bysport' },
    { href: '/bynumber', labelKey: 'bynumber' },
    { href: '/bycategory', labelKey: 'bycategory' },
    { href: '/participation', labelKey: 'submissions' },
    { href: '/reports', labelKey: 'reports' },
    { href: '/cards', labelKey: 'leaderRegistration' },
];

function getInitials(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U'
    );
}

function getBreadcrumbs(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ href: string; labelKey: string }> = [];

    for (let index = 0; index < segments.length; index += 1) {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const match = BREADCRUMB_MAP.find((item) => href === item.href || href.startsWith(`${item.href}/`));
        if (match) {
            breadcrumbs.push(match);
        }
    }

    return breadcrumbs;
}

export function TopBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, role, logout } = useAuth();
    const tNav = useTranslations('nav');
    const tCommon = useTranslations('common');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const breadcrumbs = useMemo(() => getBreadcrumbs(pathname), [pathname]);
    const displayName = user?.khmer_name || user?.english_name || user?.username || tCommon('account');
    const roleLabel = role ? tCommon(`roles.${ROLE_LABELS[role]}` as never) : tCommon('role');
    const initials = getInitials(displayName);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-white">
            <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="min-w-0 flex-1">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="truncate font-medium text-foreground">{tNav('dashboard')}</span>
                        {breadcrumbs.map((crumb) => (
                            <div key={crumb.href} className="flex min-w-0 items-center gap-1">
                                <ChevronRight className="h-4 w-4 shrink-0 text-border" />
                                <span className="truncate">{tNav(crumb.labelKey as never)}</span>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />

                    <button
                        type="button"
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:bg-accent/40 hover:text-primary"
                        aria-label="Notifications"
                    >
                        <Bell className="h-4.5 w-4.5" />
                        <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
                            3
                        </span>
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((value) => !value)}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2 text-left shadow-sm transition-colors hover:bg-accent/40"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                {initials}
                            </div>
                            <div className="hidden min-w-0 sm:block">
                                <p className="truncate text-sm font-semibold leading-snug text-foreground">{displayName}</p>
                                <p className="truncate text-xs leading-relaxed text-muted-foreground">{roleLabel}</p>
                            </div>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-white p-3 shadow-lg">
                                <div className="flex items-center gap-3 rounded-xl bg-accent/60 px-3 py-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold leading-snug text-foreground">{displayName}</p>
                                        <p className="truncate text-xs leading-relaxed text-muted-foreground">{roleLabel}</p>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-1">
                                    <button
                                        type="button"
                                        disabled
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground opacity-80 transition-colors hover:bg-accent/50 hover:text-foreground"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>{tCommon('profile')}</span>
                                    </button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-3 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>{tCommon('signOut')}</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}