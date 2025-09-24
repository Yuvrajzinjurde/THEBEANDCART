
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
import { UploadCloud, X, Edit, Instagram, Linkedin } from "lucide-react";
import type { IUser } from "@/models/user.model";
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '../ui/separator';

const socialsSchema = z.object({
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
});

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  profilePicUrl: z.string().url().or(z.literal('')).optional(),
  socials: socialsSchema.optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileInfoProps {
    user: IUser;
    onUserUpdate: (updatedUser: IUser) => void;
}

export function ProfileInfo({ user, onUserUpdate }: ProfileInfoProps) {
    const { token, login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', phone: '', whatsapp: '',
            profilePicUrl: '',
            socials: { twitter: '', linkedin: '', instagram: '' }
        },
    });

     useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || '',
                whatsapp: user.whatsapp || '',
                profilePicUrl: user.profilePicUrl || "",
                socials: user.socials || { twitter: '', linkedin: '', instagram: '' }
            });
        }
    }, [user, form]);
    
     async function onSubmit(data: ProfileFormValues) {
        setIsSubmitting(true);
        try {
            const updatePayload = { profile: data };

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
            
            if (result.token) {
                login(result.token);
            }
            onUserUpdate(result.user);
            toast.success("Profile updated successfully!");
            setIsEditing(false); // Exit edit mode on success
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
    
    const handleCancel = () => {
        form.reset(); // Revert changes
        setIsEditing(false);
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
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                                    {isSubmitting && <Loader className="mr-2" />}
                                    Save Changes
                                </Button>
                            </div>
                        ) : (
                            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4"/> Edit Profile
                            </Button>
                        )}
                    </CardHeader>
                    <fieldset disabled={!isEditing || isSubmitting}>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1">
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
                                                            {isEditing && (
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                                                    onClick={() => field.onChange('')}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            </>
                                                        ) : (
                                                            <label htmlFor="picture" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                                                <UploadCloud className="h-8 w-8 text-slate-400 mb-2"/>
                                                                <span className="text-xs text-slate-500">Click to upload</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <Input id="picture" type="file" className="hidden" onChange={handleFileChange} disabled={!isEditing} />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <div className="lg:col-span-2 space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="firstName" render={({ field }) => (
                                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="lastName" render={({ field }) => (
                                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl></FormItem>
                                    )} />
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl></FormItem>
                                        )} />
                                         <FormField control={form.control} name="whatsapp" render={({ field }) => (
                                            <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium">Social Profiles</h3>
                                <p className="text-sm text-muted-foreground mb-4">Add links to your social media profiles.</p>
                                <div className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="socials.twitter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="relative">
                                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <X className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <FormControl><Input placeholder="https://x.com/username" {...field} className="pl-10" /></FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="socials.linkedin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="relative">
                                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <Linkedin className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <FormControl><Input placeholder="https://linkedin.com/in/username" {...field} className="pl-10" /></FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="socials.instagram"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="relative">
                                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <Instagram className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <FormControl><Input placeholder="https://instagram.com/username" {...field} className="pl-10" /></FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </fieldset>
                </Card>
            </form>
        </Form>
    );
}

    