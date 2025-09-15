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
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/localization-context';

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { toast } = useToast();
  const { translate } = useLocalization();

  const navItems = [
    { href: '/dashboard', label: translate('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/diagnose', label: translate('diagnose', 'Diagnose'), icon: Stethoscope },
    { href: '/dashboard/query', label: translate('query', 'Query'), icon: MessageSquare },
    { href: '/dashboard/farm-log', label: translate('farmLog', 'Farm Log'), icon: ClipboardList },
    { href: '/dashboard/community', label: translate('community', 'Community'), icon: Users },
    { href: '/dashboard/alerts', label: translate('alerts', 'Alerts'), icon: Bell },
  ];
  
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
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={translate('settings', 'Settings')} onClick={() => toast({ title: translate('settingsPageComingSoon', 'Settings page coming soon!')})}>
                    <Settings/>
                    <span>{translate('settings', 'Settings')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Button variant="ghost" className="w-full justify-start gap-2 p-2" onClick={logout}>
                    <LogOut className="h-4 w-4"/>
                    <span className="group-data-[collapsible=icon]:hidden">{translate('logout', 'Log out')}</span>
                </Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
