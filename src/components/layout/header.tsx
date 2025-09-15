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
import { LogOut, Settings, User, Languages, MapPin, Loader2 } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/localization-context';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function AppHeader() {
    const { logout, user, updateLocation } = useAuth();
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
        className="h-6 w-6 text-primary"
      >
        <path d="M11 20A7 7 0 0 1 4 13H2a9 9 0 0 0 18 0h-2a7 7 0 0 1-7 7Z" />
        <path d="M12 10V2" />
      </svg>
    );

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <LeafIcon />
        <h1 className="hidden md:block text-xl font-headline text-primary">Krishi SahAI</h1>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <Button variant="ghost" className="hidden md:flex items-center gap-2 text-sm" onClick={() => setIsLocationModalOpen(true)}>
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[150px]">{user?.location || translate('location', 'Location')}</span>
        </Button>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-5 w-5" />
                    <span className="sr-only">Change language</span>
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
                <AvatarImage src="https://picsum.photos/seed/avatar/100" data-ai-hint="person face" />
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
             <DropdownMenuItem className="md:hidden" onClick={() => setIsLocationModalOpen(true)}>
                <MapPin className="mr-2 h-4 w-4" />
                <span>Change Location</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: translate('profilePageComingSoon', "Profile page coming soon!")})}>
              <User className="mr-2 h-4 w-4" />
              <span>{translate('profile', 'Profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: translate('settingsPageComingSoon', "Settings page coming soon!")})}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{translate('settings', 'Settings')}</span>
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
                        placeholder="e.g., Mumbai, India"
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
