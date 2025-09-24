
"use client";

import { useEffect, useState } from "react";
import withAuth from "@/components/auth/with-auth";
import { useAuth } from "@/hooks/use-auth";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, AlertCircle, UploadCloud, X, Lock } from "lucide-react";
import Header from "@/components/header";
import { GlobalFooter } from "@/components/global-footer";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import type { IUser } from "@/models/user.model";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email(),
  phone: z.string().optional(),
  username: z.string().optional(),
  nickname: z.string().optional(),
  displayName: z.string().optional(),
  website: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  bio: z.string().optional(),
  profilePicUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePage() {
    const { token, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', phone: '',
            username: '', nickname: '', displayName: '',
            website: '', whatsapp: '', telegram: '', bio: '',
            profilePicUrl: ''
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch profile.');
                setUser(data.user);
                form.reset({
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    email: data.user.email,
                    phone: data.user.phone || '',
                    username: data.user.email.split('@')[0], // Simulate username
                    nickname: data.user.firstName.toLowerCase() + '.r', // Simulate nickname
                    displayName: data.user.firstName, // Simulate display name
                    profilePicUrl: data.user.profilePicUrl || "https://picsum.photos/seed/1/400/400",
                    // The rest are examples as they are not in the user model
                    website: 'gene-roding.webflow.io',
                    whatsapp: '@gene-rod',
                    telegram: '@gene-rod',
                    bio: 'Albert Einstein was a German mathematician and physicist who developed the special and general theories of relativity. In 1921, he won the Nobel Prize for physics for his explanation of the photoelectric effect. In the following decade.'
                });
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                setError(err.message);
                if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                    toast.error("Session expired. Please log in again.");
                    logout();
                } else {
                    toast.error(err.message || 'Could not load your profile.');
                }
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading) {
            fetchProfile();
        }
    }, [token, authLoading, form, logout]);

    async function onSubmit(data: ProfileFormValues) {
        setIsSubmitting(true);
        try {
            const updatePayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                profilePicUrl: data.profilePicUrl,
            };

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setUser(result.user);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            form.setValue('profilePicUrl', reader.result as string, { shouldDirty: true });
          };
          reader.readAsDataURL(file);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader className="h-12 w-12" />
            </div>
        );
    }
    
    if (error) {
        return (
            <main className="container flex min-h-screen flex-col items-center justify-center p-4">
                 <Alert variant="destructive" className="max-w-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error} Please try logging in again.
                         <Button asChild variant="link"><Link href="/login">Go to Login</Link></Button>
                    </AlertDescription>
                </Alert>
            </main>
        )
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header />
            <main className="container py-8 px-4 sm:px-6 lg:px-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-8">
                            <h2 className="text-xl font-bold text-gray-700">Account Management</h2>
                            <Card className="shadow-lg">
                                <CardContent className="p-6">
                                    <FormField
                                        control={form.control}
                                        name="profilePicUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="relative w-full aspect-square rounded-lg p-4 bg-pink-50">
                                                    {field.value && (
                                                        <>
                                                        <Image
                                                            src={field.value}
                                                            alt="Profile Picture"
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="icon"
                                                            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/70 hover:bg-white"
                                                            onClick={() => field.onChange('')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                        </>
                                                    )}
                                                </div>
                                                <FormControl>
                                                    <div className="mt-4">
                                                        <Input id="picture" type="file" className="hidden" onChange={handleFileChange} />
                                                        <label htmlFor="picture" className="w-full text-center block border border-gray-300 bg-white hover:bg-gray-50 rounded-md py-2 cursor-pointer font-semibold text-gray-700">
                                                            Upload Photo
                                                        </label>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg">
                                 <CardContent className="p-6 space-y-4">
                                     <FormItem>
                                         <FormLabel>Old Password</FormLabel>
                                         <FormControl>
                                             <Input type="password" value="***********" readOnly />
                                         </FormControl>
                                     </FormItem>
                                     <FormItem>
                                         <FormLabel>New Password</FormLabel>
                                         <FormControl>
                                             <Input type="password" value="***********" readOnly />
                                         </FormControl>
                                     </FormItem>
                                     <Button type="button" variant="outline" className="w-full">Change Password</Button>
                                 </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2">
                             <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="username" render={({ field }) => (
                                            <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} disabled /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="firstName" render={({ field }) => (
                                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="nickname" render={({ field }) => (
                                            <FormItem><FormLabel>Nickname</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="lastName" render={({ field }) => (
                                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="displayName" render={({ field }) => (
                                        <FormItem><FormLabel>Display Name Publicly as</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />

                                    <Separator />

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem><FormLabel>Email (required)</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="whatsapp" render={({ field }) => (
                                                <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="website" render={({ field }) => (
                                                <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="telegram" render={({ field }) => (
                                                <FormItem><FormLabel>Telegram</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">About the User</h3>
                                        <FormField control={form.control} name="bio" render={({ field }) => (
                                            <FormItem><FormLabel>Biographical Info</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    
                                     <div className="flex justify-end">
                                        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                                            {isSubmitting && <Loader className="mr-2" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </Form>
            </main>
        </div>
    );
}

export default withAuth(ProfilePage, ['user', 'admin']);
