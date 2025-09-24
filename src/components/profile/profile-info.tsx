

"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { UploadCloud, X } from "lucide-react";
import type { IUser } from "@/models/user.model";
import { useAuth } from '@/hooks/use-auth';

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email(),
  phone: z.string().optional(),
  profilePicUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileInfoProps {
    user: IUser;
    onUserUpdate: (updatedUser: IUser) => void;
}

export function ProfileInfo({ user, onUserUpdate }: ProfileInfoProps) {
    const { token, login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', phone: '',
            profilePicUrl: ''
        },
    });

     useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || '',
                profilePicUrl: user.profilePicUrl || "",
            });
        }
    }, [user, form]);
    
     async function onSubmit(data: ProfileFormValues) {
        setIsSubmitting(true);
        try {
            const updatePayload = {
                profile: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    profilePicUrl: data.profilePicUrl,
                }
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
            
            // Update auth state with new token
            if (result.token) {
                login(result.token);
            }
            onUserUpdate(result.user);
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
          reader.onload = () => {
            form.setValue('profilePicUrl', reader.result as string, { shouldDirty: true });
          };
          reader.readAsDataURL(file);
        }
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Manage your personal and contact information.</CardDescription>
                        </div>
                        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                            {isSubmitting && <Loader className="mr-2" />}
                            Save Changes
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column for Picture and Password */}
                        <div className="lg:col-span-1 space-y-6">
                             <FormField
                                control={form.control}
                                name="profilePicUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profile Picture</FormLabel>
                                        <FormControl>
                                            <div className="relative w-48 h-48 rounded-lg p-2 bg-slate-100 border-2 border-dashed">
                                                {field.value ? (
                                                    <>
                                                    <Image
                                                        src={field.value}
                                                        alt="Profile Picture"
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                                        onClick={() => field.onChange('')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    </>
                                                ) : (
                                                    <label htmlFor="picture" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                                        <UploadCloud className="h-8 w-8 text-slate-400 mb-2"/>
                                                        <span className="text-xs text-slate-500">Click to upload</span>
                                                    </label>
                                                )}
                                            </div>
                                        </FormControl>
                                        <Input id="picture" type="file" className="hidden" onChange={handleFileChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Card>
                                 <CardContent className="p-4 space-y-3">
                                     <FormItem>
                                         <FormLabel>Old Password</FormLabel>
                                         <FormControl>
                                             <Input type="password" value="***********" readOnly disabled />
                                         </FormControl>
                                     </FormItem>
                                     <FormItem>
                                         <FormLabel>New Password</FormLabel>
                                         <FormControl>
                                             <Input type="password" value="***********" readOnly disabled />
                                         </FormControl>
                                     </FormItem>
                                     <Button type="button" variant="outline" className="w-full" disabled>Change Password</Button>
                                 </CardContent>
                            </Card>
                        </div>

                         {/* Right Column for Profile Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl></FormItem>
                                )} />
                                 <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
