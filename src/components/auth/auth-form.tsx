
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2, MapPin, LocateFixed } from 'lucide-react';
import Image from 'next/image';
import { useLocalization } from '@/context/localization-context';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  location: z.string()
    .min(1, { message: 'Location is required.' })
    .refine(value => /^[^,]+,\s*[^,]+$/.test(value), {
      message: 'Location must be in "City, Country" format (e.g., Vellore, India).',
    }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login, signup, forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { translate } = useLocalization();
  const { toast } = useToast();
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const formSchema = mode === 'login' ? loginSchema : signupSchema;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'signup' && { name: '', location: '' }),
    },
  });

  const handleFetchLocation = () => {
    setIsFetchingLocation(true);
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation is not supported by your browser.' });
      setIsFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          if (!apiKey) {
            throw new Error("API key not configured.");
          }
          const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
          const response = await fetch(geoUrl);
          const data = await response.json();
          if (data && data.length > 0) {
            const { name, country } = data[0];
            const locationString = `${name}, ${country}`;
            form.setValue('location', locationString, { shouldValidate: true });
             toast({ title: 'Location found!', description: locationString });
          } else {
            throw new Error('Could not determine location from coordinates.');
          }
        } catch (error) {
           toast({ variant: 'destructive', title: 'Could not fetch location name.' });
        } finally {
            setIsFetchingLocation(false);
        }
      },
      (error) => {
        toast({ variant: 'destructive', title: 'Unable to retrieve your location.', description: error.message });
        setIsFetchingLocation(false);
      }
    );
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const loginValues = values as z.infer<typeof loginSchema>;
        await login(loginValues.email, loginValues.password);
      } else {
        const signupValues = values as z.infer<typeof signupSchema>;
        await signup(signupValues.name, signupValues.email, signupValues.password, signupValues.location);
      }
    } catch (e: any) {
        let friendlyMessage = "An unexpected error occurred.";
        if (e.message) {
            friendlyMessage = e.message;
        }
      setError(friendlyMessage);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: friendlyMessage,
      })
    } finally {
        setIsLoading(false);
    }
  }

  const handleForgotPassword = () => {
    if(!forgotPasswordEmail) {
        toast({
            variant: 'destructive',
            title: 'Email Required',
            description: 'Please enter your email address.',
        });
        return;
    }
    forgotPassword(forgotPasswordEmail);
    setForgotPasswordEmail('');
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
      className="h-8 w-8 text-primary"
    >
      <path d="M11 20A7 7 0 0 1 4 13H2a9 9 0 0 0 18 0h-2a7 7 0 0 1-7 7Z" />
      <path d="M12 10V2" />
    </svg>
  );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
      <Image
        src="https://picsum.photos/seed/farm/1920/1080"
        alt="Farmer in a field"
        fill
        className="object-cover -z-10 brightness-75"
        data-ai-hint="farm field"
      />
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <LeafIcon />
                <h1 className="text-3xl font-headline text-primary">Krishi SahAI</h1>
            </div>
            <CardTitle className="text-2xl font-headline">
              {mode === 'login' ? translate('welcomeBack', 'Welcome Back') : translate('createAccount', 'Create an Account')}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? translate('loginToDashboard', 'Sign in to access your dashboard') : translate('aiCompanionAwaits', 'Your AI companion for farming awaits')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {mode === 'signup' && (
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{translate('name', 'Name')}</FormLabel>
                            <FormControl>
                                <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate('email', 'Email')}</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                         <FormLabel>{translate('password', 'Password')}</FormLabel>
                         {mode === 'login' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="link" type="button" className="p-0 h-auto text-xs text-primary">Forgot password?</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Forgot Password?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Enter your email address and we'll send you a link to reset your password.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-email">Email</Label>
                                        <Input
                                            id="forgot-email"
                                            placeholder="name@example.com"
                                            value={forgotPasswordEmail}
                                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        />
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleForgotPassword}>Submit</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         )}
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mode === 'signup' && (
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate('location', 'Location')}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="e.g., Vellore, India" {...field} className="pl-10 pr-24" />
                                 <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                                    onClick={handleFetchLocation}
                                    disabled={isFetchingLocation}
                                >
                                    {isFetchingLocation ? <Loader2 className="h-4 w-4 animate-spin"/> : <LocateFixed className="h-4 w-4"/>}
                                    <span className="ml-2 hidden sm:inline">Use current location</span>
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'login' ? translate('login', 'Log In') : translate('signup', 'Sign Up')}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  {translate('dontHaveAccount', "Don't have an account?")}{' '}
                  <Link href="/signup" className="underline text-primary">
                    {translate('signup', 'Sign up')}
                  </Link>
                </>
              ) : (
                <>
                  {translate('alreadyHaveAccount', 'Already have an account?')}{' '}
                  <Link href="/" className="underline text-primary">
                    {translate('login', 'Log in')}
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
