'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, MapPin, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
});

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
        },
    });

    const { isSubmitting } = form.formState;

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

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline flex items-center gap-3">
                    <User className="text-primary" />
                    My Profile
                </h1>
                <p className="text-muted-foreground">View and manage your account details.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
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
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Update your personal information here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
