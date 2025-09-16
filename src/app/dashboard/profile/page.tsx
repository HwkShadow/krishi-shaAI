'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, MapPin, Loader2, ClipboardList, Users2, CalendarDays, Bell, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLogs } from '@/context/log-context';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
});

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { logs } = useLogs();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        values: {
            name: user?.name || '',
        },
    });

    const { isSubmitting, isDirty } = form.formState;

    const onSubmit = (values: z.infer<typeof profileSchema>) => {
        updateUser({ name: values.name });
        toast({
            title: 'Profile Updated',
            description: 'Your name has been successfully updated.',
        });
        form.reset({ name: values.name });
    };

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
            <div className="space-y-1">
                <h1 className="text-3xl font-headline flex items-center gap-3">
                    <User className="text-primary" />
                    My Profile
                </h1>
                <p className="text-muted-foreground">View and manage your account details.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src="https://picsum.photos/seed/avatar/100" data-ai-hint="person face" />
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
                     <Card>
                        <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                           <StatCard icon={ClipboardList} label="Farm Logs" value={logs.length} />
                           <StatCard icon={Users2} label="Community Posts" value={4} />
                           <StatCard icon={CalendarDays} label="Member Since" value="July 2024" />
                        </CardContent>
                    </Card>
                </div>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Update your personal information and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                 <h3 className="font-semibold text-lg">Personal Information</h3>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your full name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" value={user.email} disabled />
                                  <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                                </div>
                                
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSubmitting || !isDirty}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <Separator />
                        
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Bell /> Notifications</h3>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive important updates via email.</p>
                                </div>
                                <Switch id="email-notifications" defaultChecked />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Get real-time alerts on your device.</p>
                                </div>
                                <Switch id="push-notifications" />
                            </div>
                        </div>

                        <Separator />

                         <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Shield /> Security</h3>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                     <Label className="font-medium">Password</Label>
                                      <p className="text-xs text-muted-foreground">Last changed 3 months ago.</p>
                                </div>
                                <Button variant="outline" onClick={() => toast({title: "This is for demonstration only."})}>Change Password</Button>
                            </div>
                        </div>


                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
