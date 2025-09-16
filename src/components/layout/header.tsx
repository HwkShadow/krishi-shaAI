
'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Languages, MapPin, Loader2, PanelLeft } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/localization-context';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useSidebar } from '../ui/sidebar';
import Link from 'next/link';

const locationRegex = /^[^,]+,\s*[^,]+$/;

export function AppHeader() {
    const { logout, user, updateLocation } = useAuth();
    const { toggleSidebar } = useSidebar();
    const { toast } = useToast();
    const { language, setLanguage, translate } = useLocalization();
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [newLocation, setNewLocation] = useState(user?.location || '');
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

    const handleLocationUpdate = () => {
        if (!newLocation.trim()) {
            toast({
                variant: 'destructive',
                title: 'Invalid Location',
                description: 'Please enter a valid location.',
            });
            return;
        }
        if (!locationRegex.test(newLocation)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Format',
                description: 'Location must be in "City, Country" format (e.g., Vellore, India).',
            });
            return;
        }
        setIsUpdatingLocation(true);
        // Simulate API call
        setTimeout(() => {
            updateLocation(newLocation);
            setIsUpdatingLocation(false);
            setIsLocationModalOpen(false);
            toast({
                title: 'Location Updated',
                description: `Your location has been set to ${newLocation}.`,
            });
        }, 500);
    }
    
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-4">
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Languages className="h-5 w-5 text-muted-foreground" />
                    <span>{language.toUpperCase()}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'hi' | 'ml')}>
                    <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="hi">हिन्दी (Hindi)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ml">മലയാളം (Malayalam)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL ?? undefined} />
                <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || translate('user', 'User')}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => setIsLocationModalOpen(true)}>
                <MapPin className="mr-2 h-4 w-4" />
                <span>Change Location</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>{translate('profile', 'Profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{translate('settings', 'Settings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{translate('logout', 'Log out')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

       <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Change Location</DialogTitle>
                <DialogDescription>
                    Update your location to get personalized weather forecasts and news.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location-input" className="text-right">
                        Location
                    </Label>
                    <Input
                        id="location-input"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., Vellore, India"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsLocationModalOpen(false)}>Cancel</Button>
                <Button onClick={handleLocationUpdate} disabled={isUpdatingLocation}>
                    {isUpdatingLocation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>

    </header>
  );
}

    