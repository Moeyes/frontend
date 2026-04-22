/**
 * Sidebar Component
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  Layers, 
  Building2, 
  Users, 
  ClipboardList, 
  UserCheck, 
  CreditCard, 
  FilePieChart, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.ORGANIZATION, UserRole.FEDERATION] },
  { label: 'Events', href: '/events', icon: Calendar, roles: [UserRole.ADMIN] },
  { label: 'Sports', href: '/sports', icon: Trophy, roles: [UserRole.ADMIN] },
  { label: 'Categories', href: '/bycategory', icon: Layers, roles: [UserRole.ADMIN, UserRole.FEDERATION] },
  { label: 'Organizations', href: '/organizations', icon: Building2, roles: [UserRole.ADMIN] },
  { label: 'Users', href: '/users', icon: Users, roles: [UserRole.ADMIN] },
  { label: 'Registration', href: '/register', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.ORGANIZATION] },
  { label: 'Participation', href: '/participation', icon: UserCheck, roles: [UserRole.ADMIN, UserRole.ORGANIZATION] },
  { label: 'Cards', href: '/cards', icon: CreditCard, roles: [UserRole.ADMIN, UserRole.ORGANIZATION] },
  { label: 'Reports', href: '/reports', icon: FilePieChart, roles: [UserRole.ADMIN, UserRole.ORGANIZATION] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const filteredItems = MENU_ITEMS.filter(item => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-black text-xl tracking-tight text-foreground uppercase">MOEYS</span>
        </div>

        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border bg-secondary/30">
        <div className="mb-4 px-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logged in as</p>
          <p className="text-xs font-bold text-foreground truncate">{user?.khmer_name || user?.username}</p>
          <div className="mt-1 inline-flex px-2 py-0.5 bg-primary/10 rounded-full">
             <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{role}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-11 border-border bg-card hover:bg-error/5 hover:text-error hover:border-error/20 group transition-all"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-error transition-colors" />
          <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
