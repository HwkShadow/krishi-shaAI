
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Bell, Shield, Settings, User, Camera, Upload, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters.'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
});


export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = React.useState(false);
    const [cameraMode, setCameraMode] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        values: {
            name: user?.name || '',
        },
    });
    
    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        }
    })

    const { isSubmitting, isDirty } = form.formState;

    const onSubmit = (values: z.infer<typeof profileSchema>) => {
        updateUser({ name: values.name });
        toast({
            title: 'Profile Updated',
            description: 'Your name has been successfully updated.',
        });
        form.reset({ name: values.name });
    };

    const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
        // This is a mock password change for demonstration
        console.log("Password change requested", values);
        toast({
            title: "Password Changed",
            description: "Your password has been successfully updated."
        });
        passwordForm.reset();
        setIsPasswordDialogOpen(false);
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const openCamera = async () => {
        setCameraMode(true);
        setPreviewImage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
            setCameraMode(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/png');
            setPreviewImage(dataUrl);
            setCameraMode(false);
            stopCamera();
        }
    };

    const saveProfilePicture = () => {
        if (previewImage) {
            updateUser({ photoURL: previewImage });
            toast({ title: 'Profile Picture Updated' });
        }
        setIsPhotoDialogOpen(false);
        setPreviewImage(null);
        setCameraMode(false);
    };

    const removeProfilePicture = () => {
        updateUser({ photoURL: '' });
        toast({ title: 'Profile Picture Removed' });
        setIsPhotoDialogOpen(false);
    };

    const resetPhotoDialog = (open: boolean) => {
        if (!open) {
            stopCamera();
            setPreviewImage(null);
            setCameraMode(false);
        }
        setIsPhotoDialogOpen(open);
    }

    if (!user) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6 max-w-4xl mx-auto">
                 <div className="space-y-1">
                    <h1 className="text-3xl font-headline flex items-center gap-3">
                        <Settings className="text-primary" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Update your personal information and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex items-center gap-6">
                            <Dialog open={isPhotoDialogOpen} onOpenChange={resetPhotoDialog}>
                                <DialogTrigger asChild>
                                    <button className="relative group">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback className="text-3xl">{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Update Profile Picture</DialogTitle>
                                    </DialogHeader>
                                    {cameraMode ? (
                                        <div className="space-y-4">
                                            <video ref={videoRef} autoPlay playsInline className="w-full rounded-md" />
                                            <Button onClick={takePicture} className="w-full">Take Picture</Button>
                                            <canvas ref={canvasRef} className="hidden" />
                                        </div>
                                    ) : previewImage ? (
                                        <div className="space-y-4 flex flex-col items-center">
                                            <Image src={previewImage} alt="Preview" width={200} height={200} className="rounded-full object-cover h-48 w-48" />
                                            <div className="flex gap-2">
                                                <Button onClick={saveProfilePicture}>Save Photo</Button>
                                                <Button variant="outline" onClick={() => setPreviewImage(null)}>Try Again</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button variant="outline" onClick={openCamera} className="h-24 flex-col gap-2">
                                                <Camera className="h-6 w-6" />
                                                <span>Take Photo</span>
                                            </Button>
                                            <Button variant="outline" asChild className="h-24 flex-col gap-2 cursor-pointer">
                                                <div>
                                                    <Upload className="h-6 w-6" />
                                                    <span>Upload</span>
                                                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                                                </div>
                                            </Button>
                                             {user.photoURL && (
                                                <Button variant="destructive" onClick={removeProfilePicture} className="col-span-2">
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    Remove Photo
                                                </Button>
                                             )}
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
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
                        </div>
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
                                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>Change Password</Button>
                            </div>
                        </div>


                    </CardContent>
                </Card>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                           Enter your current and new password.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => { setIsPasswordDialogOpen(false); passwordForm.reset();}}>Cancel</Button>
                                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                     {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Change Password
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );

    