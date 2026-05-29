'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/core/auth';
import { useTranslations } from 'next-intl';
import {
    LayoutDashboard, Calendar, Trophy, Layers, Building2,
    Users, ClipboardList, UserCheck, CreditCard, FilePieChart,
    LogOut, ChevronRight, Shield
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/ui';

interface MenuItem {
    labelKey: string;
    href: string;
    icon: React.ElementType;
    roles: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
    { labelKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZATION, UserRole.FEDERATION] },
    { labelKey: 'events', href: '/events', icon: Calendar, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { labelKey: 'sports', href: '/sports', icon: Trophy, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { labelKey: 'categories', href: '/bycategory', icon: Layers, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FEDERATION] },
    { labelKey: 'organizations', href: '/organizations', icon: Building2, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { labelKey: 'users', href: '/users', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { labelKey: 'registration', href: '/register', icon: ClipboardList, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZATION] },
    { labelKey: 'participation', href: '/participation', icon: UserCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZATION] },
    { labelKey: 'cards', href: '/cards', icon: CreditCard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZATION] },
    { labelKey: 'reports', href: '/reports', icon: FilePieChart, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZATION] },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, role, logout } = useAuth();
    const router = useRouter();
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const filteredItems = MENU_ITEMS.filter(item => {
        if (!role) return false;
        return item.roles.includes(role);
    });

    return (
        <aside className="w-64 bg-card border-r border-border h-screen flex flex-col sticky top-0 z-50 shadow-sm">
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-10 px-2 transition-all hover:scale-105 duration-300">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Trophy className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-foreground uppercase block leading-none">MOEYS</span>
                        <span className="text-[8px] font-black tracking-[0.2em] text-muted-foreground uppercase opacity-50">{t('portalVersion')}</span>
                    </div>
                </div>

                <nav className="space-y-1.5 flex-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10 translate-x-1"
                                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:translate-x-1"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                                    <span className="text-xs font-black uppercase tracking-widest">{t(item.labelKey)}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 opacity-50 animate-in slide-in-from-left-2" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-border space-y-4">
                    <LanguageSwitcher />

                    <div className="px-4 py-4 rounded-2xl bg-secondary/30 border border-border/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{tCommon('account')}</p>
                        <p className="text-sm font-black text-foreground truncate relative z-10">{user?.khmer_name || user?.username}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground rounded-lg shadow-sm">
                            <Shield className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{role}</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-12 rounded-xl border-border bg-card hover:bg-error/5 hover:text-error hover:border-error/20 group transition-all"
                        onClick={handleLogout}
                    >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-error/10 transition-colors">
                            <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-error transition-colors" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{tCommon('signOut')}</span>
                    </Button>
                </div>
            </div>
        </aside>
    );
}
