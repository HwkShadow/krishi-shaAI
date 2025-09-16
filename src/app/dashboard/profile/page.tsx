
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, MapPin, Loader2, ClipboardList, Users2, CalendarDays, Settings } from 'lucide-react';
import { useLogs } from '@/context/log-context';
import { format } from 'date-fns';
import Link from 'next/link';
import { useCommunity } from '@/context/community-context';

export default function ProfilePage() {
    const { user } = useAuth();
    const { logs } = useLogs();
    const { discussions, isPending } = useCommunity();

    const communityPostsCount = React.useMemo(() => {
        if (!user || !discussions) return 0;
        const userDiscussions = discussions.filter(d => d.authorEmail === user.email).length;
        const userComments = discussions.reduce((acc, d) => {
            return acc + d.comments.filter(c => c.authorEmail === user.email).length;
        }, 0);
        return userDiscussions + userComments;
    }, [discussions, user]);


    if (!user) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const StatCard = ({ icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
        <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
                {React.createElement(icon, { className: "h-5 w-5" })}
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-bold text-lg">{value}</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-headline flex items-center gap-3">
                        <User className="text-primary" />
                        My Profile
                    </h1>
                    <p className="text-muted-foreground">An overview of your account and activity.</p>
                </div>
                 <Button asChild>
                    <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4"/>
                        Account Settings
                    </Link>
                </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className="text-3xl">{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{user.location}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                        <CardDescription>Your activity at a glance.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4">
                        <StatCard icon={ClipboardList} label="Farm Logs" value={logs.length} />
                        <StatCard icon={Users2} label="Community Posts" value={isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : communityPostsCount} />
                        <StatCard icon={CalendarDays} label="Member Since" value={user.memberSince ? format(new Date(user.memberSince), 'MMMM yyyy') : 'N/A'} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
