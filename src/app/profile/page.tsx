
"use client";

import { useEffect, useState } from "react";
import withAuth from "@/components/auth/with-auth";
import { useAuth, type User as AuthUser } from "@/hooks/use-auth";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, MapPin, Edit, Save } from "lucide-react";
import Header from "@/components/header";
import { GlobalFooter } from "@/components/global-footer";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import type { IUser } from "@/models/user.model";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePage() {
    const { user: authUser, token } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
        },
    });
    
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const response = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch profile.');
                const data = await response.json();
                setUser(data.user);
                form.reset({
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    email: data.user.email,
                    phone: data.user.phone || '',
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token, form]);

    async function onSubmit(data: ProfileFormValues) {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setUser(result.user);
            form.reset(result.user);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const UserDetails = ({ user }: { user: IUser }) => (
         <div className="space-y-4">
            <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground w-24">Name</p>
                <p>{user.firstName} {user.lastName}</p>
            </div>
             <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground w-24">Email</p>
                <p>{user.email}</p>
            </div>
             <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground w-24">Phone</p>
                <p>{user.phone || 'Not provided'}</p>
            </div>
        </div>
    );

    const ProfileForm = () => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" disabled {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setIsEditing(false); form.reset(); }}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader className="mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader className="h-12 w-12" />
            </div>
        );
    }
    
    if (!user) {
        return <p>User not found.</p>
    }

    return (
        <>
            <Header />
            <main className="container py-8 px-10 flex-grow">
                 <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                         <Card>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2"><UserIcon /> Personal Information</CardTitle>
                                    <CardDescription>View and edit your personal details.</CardDescription>
                                </div>
                                {!isEditing && (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {isEditing ? <ProfileForm /> : <UserDetails user={user} />}
                            </CardContent>
                        </Card>
                    </div>
                     <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MapPin/>Saved Addresses</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-muted-foreground py-10">
                                <p>No saved addresses yet.</p>
                                <Button variant="link">Add a new address</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <GlobalFooter />
        </>
    );
}

export default withAuth(ProfilePage, ['user', 'admin']);
