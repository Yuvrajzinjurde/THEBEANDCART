

"use client";

import React, { useState, useEffect } from 'react';
import withAuth from "@/components/auth/with-auth";
import Header from "@/components/header";
import { GlobalFooter } from "@/components/global-footer";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, MapPin, Package, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import type { IUser } from "@/models/user.model";
import { ProfileInfo } from '@/components/profile/profile-info';
import { SavedAddresses } from '@/components/profile/saved-addresses';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

type ProfileSection = 'profile' | 'addresses';

const faqs = [
    {
        question: "What happens when I update my email address (or mobile number)?",
        answer: "Your login email ID (or mobile number) changes. You'll receive all your account-related communication on your updated email address (or mobile number)."
    },
    {
        question: "When will my account be updated with the new email address (or mobile number)?",
        answer: "It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes."
    },
    {
        question: "What happens to my existing account when I update my details?",
        answer: "Updating your details doesn't invalidate your account. Your account remains fully functional. You'll continue to see your order history, saved information, and personal details."
    }
];

function ProfilePage() {
    const { token, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<ProfileSection>('profile');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setLoading(false);
                return;
            };

            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                     throw new Error(data.message || 'Failed to fetch profile.');
                }
                const data = await response.json();
                setUser(data.user);

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
    }, [token, authLoading, logout]);

    const handleUserUpdate = (updatedUser: IUser) => {
        setUser(updatedUser);
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
                         <Link href="/login" className="font-bold underline">Go to Login</Link>
                    </AlertDescription>
                </Alert>
            </main>
        )
    }

    if (!user) {
        return null; // Should be redirected by withAuth HOC
    }
    
    const sidebarItems = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
        { id: 'orders', label: 'My Orders', icon: Package, href: '/orders' },
    ];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Header />
            <main className="container flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <aside className="md:col-span-1">
                        <div className="sticky top-24 space-y-2">
                           {sidebarItems.map(item => (
                                item.href ? (
                                    <Link key={item.id} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ) : (
                                    <button 
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id as ProfileSection)}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                                            activeSection === item.id 
                                                ? "bg-slate-200 text-slate-900 font-semibold" 
                                                : "text-gray-600 hover:bg-slate-100 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                )
                           ))}
                            <button 
                                onClick={() => { logout(); router.push('/'); }}
                                className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </aside>
                    <div className="md:col-span-3 space-y-8">
                        {activeSection === 'profile' && <ProfileInfo user={user} onUserUpdate={handleUserUpdate} />}
                        {activeSection === 'addresses' && <SavedAddresses user={user} onUserUpdate={handleUserUpdate} />}
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Frequently Asked Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                                            <AccordionContent>{faq.answer}</AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-4">
                                <Button variant="outline">Deactivate Account</Button>
                                <Button variant="destructive">Delete Account</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <GlobalFooter />
        </div>
    );
}

export default withAuth(ProfilePage, ['user', 'admin']);
