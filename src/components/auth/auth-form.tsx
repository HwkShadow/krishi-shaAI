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
import { Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  location: z.string().optional(),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      location: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      login(values.email, values.location);
      setIsLoading(false);
    }, 1000);
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
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="grid lg:grid-cols-2 max-w-6xl w-full">
        <div className="hidden lg:flex flex-col items-center justify-center bg-primary/10 rounded-l-lg p-8 text-center">
            <Image 
                src="https://picsum.photos/seed/farmer/800/1000"
                width={800}
                height={1000}
                alt="Farmer in a field"
                className="w-full h-full object-cover rounded-md"
                data-ai-hint="farmer field"
            />
        </div>
        <Card className="rounded-r-lg rounded-l-lg lg:rounded-l-none border-l-0">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <LeafIcon />
                <h1 className="text-3xl font-headline text-primary">Krishi SahAI</h1>
            </div>
            <CardTitle className="text-2xl font-headline">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Sign in to access your dashboard' : 'Your AI companion for farming awaits'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                      <FormLabel>Password</FormLabel>
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="e.g., Punjab, India" {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'login' ? 'Log In' : 'Sign Up'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="underline text-primary">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link href="/" className="underline text-primary">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
