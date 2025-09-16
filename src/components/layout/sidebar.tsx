
'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Bot,
  Tractor,
  Users,
  Bell,
  LogOut,
  Settings,
  LifeBuoy,
  User,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/localization-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function AppSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const { translate } = useLocalization();

  const navItems = [
    { href: '/dashboard', label: translate('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/query', label: translate('aiAssistant', 'AI Assistant'), icon: Bot },
    { href: '/dashboard/farm-log', label: translate('farmManagement', 'Farm Management'), icon: Tractor },
    { href: '/dashboard/diagnose', label: translate('diagnose', 'Diagnose'), icon: LifeBuoy },
    { href: '/dashboard/community', label: translate('community', 'Farmer\'s Community'), icon: Users },
    { href: '/dashboard/alerts', label: translate('alertsAndNews', 'Alerts & News'), icon: Bell },
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
      <SidebarHeader className="border-b-0 p-4">
        <div className="flex items-center gap-2">
            <LeafIcon />
            <div>
              <h1 className="text-xl font-semibold text-primary">Krishi SahAI</h1>
              <p className='text-xs text-muted-foreground'>{translate('kisanKaSathi', 'किसान का साथी')}</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                tooltip={item.label}
                className="h-10 justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           {user?.isAdmin && (
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard/admin'}
                tooltip="Admin"
                className="h-10 justify-start"
              >
                <Link href="/dashboard/admin">
                  <Shield className="h-5 w-5" />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
           )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t-0 p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={translate('myProfile', 'My Profile')} className='h-auto py-2 justify-start'>
                  <Link href="/dashboard/profile">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL ?? undefined} />
                        <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>{user?.name || 'User'}</p>
                        <p className='text-xs text-muted-foreground'>{translate('profile', 'Profile')}</p>
                      </div>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" className="h-10 justify-start">
                  <Link href="/dashboard/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
