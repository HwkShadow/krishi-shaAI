'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Stethoscope,
  MessageSquare,
  ClipboardList,
  Users,
  Bell,
  LogOut,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/diagnose', label: 'Diagnose', icon: Stethoscope },
  { href: '/dashboard/query', label: 'Query', icon: MessageSquare },
  { href: '/dashboard/farm-log', label: 'Farm Log', icon: ClipboardList },
  { href: '/dashboard/community', label: 'Community', icon: Users },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const LeafIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary"
    >
      <path d="M11 20A7 7 0 0 1 4 13H2a9 9 0 0 0 18 0h-2a7 7 0 0 1-7 7Z" />
      <path d="M12 10V2" />
    </svg>
  );

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
            <LeafIcon />
            <h1 className="text-2xl font-headline text-primary">Krishi SahAI</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                    <Settings/>
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Button variant="ghost" className="w-full justify-start gap-2 p-2" onClick={logout}>
                    <LogOut className="h-4 w-4"/>
                    <span className="group-data-[collapsible=icon]:hidden">Log out</span>
                </Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
