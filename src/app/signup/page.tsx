'use client';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
        router.replace('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);
    
    if (isLoading || isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <AuthForm mode="signup" />;
}
