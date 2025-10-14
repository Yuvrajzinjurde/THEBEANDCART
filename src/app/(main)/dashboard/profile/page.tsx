
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { UploadCloud, X, Save, Edit, Twitter, Instagram, Facebook, Linkedin, Link as LinkIcon, AtSign, Phone, MessageSquare, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";
import { useForm, type FieldValues } from "react-hook-form";
import type { IUser } from "@/models/user.model";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const DangerZoneAction = ({
  action,
  title,
  description,
  buttonText,
  onConfirm,
}: {
  action: 'deactivate' | 'delete';
  title: string;
  description: string;
  buttonText: string;
  onConfirm: (otp: string) => Promise<void>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'initial' | 'otp'>('initial');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleInitialConfirm = async () => {
    if (!user?.phone || !user.isPhoneVerified) {
      toast.error("You must have a verified phone number to perform this action.");
      return;
    }
    // In a real app, you would send an OTP here. We reuse the static OTP logic.
    toast.info("An OTP has been sent to your verified phone number.");
    setStep('otp');
  };

  const handleFinalConfirm = async () => {
    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    await onConfirm(otp);
    setIsSubmitting(false);
    setIsOpen(false);
    setStep('initial');
    setOtp('');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={action === 'delete' ? 'destructive' : 'outline'} className={action === 'deactivate' ? "border-destructive text-destructive" : ""}>
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{step === 'initial' ? title : 'Enter OTP to Confirm'}</AlertDialogTitle>
          <AlertDialogDescription>
            {step === 'initial' ? description : `Please enter the 6-digit code sent to your phone to finalize this action. (Hint: use 123456)`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {step === 'otp' && (
          <div className="py-4">
             <Input 
                id="otp" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                maxLength={6} 
                placeholder="123456"
             />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setStep('initial'); setOtp(''); }}>Cancel</AlertDialogCancel>
          {step === 'initial' ? (
            <AlertDialogAction onClick={handleInitialConfirm}>
              I understand, continue
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={handleFinalConfirm} disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
              Confirm Action
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};



export default function ProfilePage() {
  const { user, token, checkUser, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const form = useForm({
      defaultValues: {
          firstName: '',
          lastName: '',
          nickname: '',
          displayName: '',
          phone: '',
          isPhoneVerified: false,
          whatsapp: '',
          socials: {
              website: '',
              telegram: '',
              twitter: '',
              instagram: '',
              facebook: '',
              linkedin: '',
          },
          profilePicUrl: '',
      }
  });

  const { formState: { isDirty }, reset, watch, setValue } = form;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('profilePicUrl', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const phoneValue = watch('phone');
  const isPhoneVerified = watch('isPhoneVerified');

  useEffect(() => {
    if (user) {
        const u = user as unknown as IUser;
        reset({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            nickname: u.nickname || '',
            displayName: u.displayName || '',
            phone: u.phone || '',
            isPhoneVerified: u.isPhoneVerified || false,
            whatsapp: u.whatsapp || '',
            socials: {
                website: u.socials?.website || '',
                telegram: u.socials?.telegram || '',
                twitter: u.socials?.twitter || '',
                instagram: u.socials?.instagram || '',
                facebook: u.socials?.facebook || '',
                linkedin: u.socials?.linkedin || '',
            },
            profilePicUrl: u.profilePicUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.firstName || 'default'}`,
        });
    }
  }, [user, reset]);


  const profilePicUrl = watch('profilePicUrl') || `https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.firstName || 'default'}`;
  const email = (user as any)?.email || '';
  const username = email.split('@')[0];

  const handleSaveChanges = form.handleSubmit(async (data: FieldValues) => {
    setIsSubmitting(true);
    toast.info("Saving changes...");
    try {
        const response = await fetch(`/api/users/${user?._id}/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to update profile.");
        }
        await checkUser(); // Re-fetch user data to update the auth context
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    } catch (error: any) {
        console.error(error);
        toast.error(error.message);
    } finally {
        setIsSubmitting(false);
    }
  });

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelAlertOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
        const u = user as unknown as IUser;
        reset({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            nickname: u.nickname || '',
            displayName: u.displayName || '',
            phone: u.phone || '',
            isPhoneVerified: u.isPhoneVerified || false,
            whatsapp: u.whatsapp || '',
            socials: {
                website: u.socials?.website || '',
                telegram: u.socials?.telegram || '',
                twitter: u.socials?.twitter || '',
                instagram: u.socials?.instagram || '',
                facebook: u.socials?.facebook || '',
                linkedin: u.socials?.linkedin || '',
            },
            profilePicUrl: u.profilePicUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.firstName || 'default'}`,
        });
    }
    setIsEditing(false);
    setIsCancelAlertOpen(false);
    toast.warn("Changes discarded.");
  };

  const handleSendOtp = async () => {
    if (!phoneValue || phoneValue.length < 10) {
        toast.error("Please enter a valid phone number.");
        return;
    }
    setIsSendingOtp(true);
    try {
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneValue })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setOtpSent(true);
        toast.success("OTP sent successfully.");
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsSendingOtp(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
        toast.error("Please enter a valid OTP.");
        return;
    }
    setIsVerifyingOtp(true);
    try {
        const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ phone: phoneValue, code: otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setValue('isPhoneVerified', true, { shouldDirty: true });
        setOtpSent(false);
        toast.success("Phone number verified successfully!");
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsVerifyingOtp(false);
    }
  };
  
    const handleDeactivate = async (otp: string) => {
        try {
            const res = await fetch(`/api/users/${user?._id}/deactivate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Account deactivated successfully. You have been logged out.");
            logout();
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || "Failed to deactivate account.");
        }
    };
    
    const handleDeleteAccount = async (otp: string) => {
        try {
            const res = await fetch(`/api/users/${user?._id}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp })
            });
            if (!res.ok) {
                 const data = await res.json();
                 throw new Error(data.message);
            }
            toast.success("Account deleted successfully. We're sorry to see you go.");
            logout();
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account.");
        }
    };

  return (
    <div className="space-y-6">
        <Form {...form}>
            <form>
                <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>View and manage your personal information.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing && (
                                <>
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
                                <Button type="button" onClick={handleSaveChanges} disabled={isSubmitting || !isDirty}>
                                    {isSubmitting ? <Loader className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                                </>
                            )}
                            {!isEditing && (
                                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <fieldset disabled={!isEditing} className="group">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column */}
                                <div className="lg:col-span-1 space-y-6">
                                    <Card className="group-disabled:bg-muted/30">
                                        <CardHeader>
                                            <CardTitle>Account Management</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="relative mx-auto w-40 h-40">
                                                <Image 
                                                    src={profilePicUrl}
                                                    alt="User profile picture" 
                                                    width={160} 
                                                    height={160} 
                                                    className="rounded-lg object-cover" 
                                                    data-ai-hint="man wearing beanie"
                                                />
                                                {isEditing && (
                                                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setValue('profilePicUrl', '')}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <Button type="button" variant="outline" className="w-full" disabled={!isEditing} onClick={() => document.getElementById('profile-pic-upload')?.click()}>
                                                <UploadCloud className="mr-2 h-4 w-4" />
                                                Upload Photo
                                            </Button>
                                            <Input id="profile-pic-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            <Separator />
                                            <div>
                                                <Label htmlFor="old-password">Old Password</Label>
                                                <Input id="old-password" type="password" defaultValue="••••••••" disabled={!isEditing} />
                                            </div>
                                            <div>
                                                <Label htmlFor="new-password">New Password</Label>
                                                <Input id="new-password" type="password" disabled={!isEditing} />
                                            </div>
                                            <Button type="button" className="w-full" disabled={!isEditing}>Change Password</Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="group-disabled:bg-muted/30">
                                        <CardHeader>
                                            <CardTitle>Profile Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="username">Username</Label>
                                                    <Input id="username" value={username} disabled />
                                                </div>
                                                <FormField control={form.control} name="nickname" render={({ field }) => (
                                                  <FormItem><FormLabel>Nickname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <div className="md:col-span-2">
                                                    <FormField control={form.control} name="displayName" render={({ field }) => (
                                                      <FormItem><FormLabel>Display Name Publicly as</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="group-disabled:bg-muted/30">
                                        <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email (required)</Label>
                                                <Input id="email" type="email" value={email} disabled />
                                            </div>
                                            <div className="space-y-2">
                                                <FormField control={form.control} name="phone" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4"/>Contact Number
                                                            {isPhoneVerified && <ShieldCheck className="h-4 w-4 text-green-500" />}
                                                        </FormLabel>
                                                        <div className="flex gap-2">
                                                            <FormControl>
                                                                <Input {...field} disabled={isPhoneVerified || !isEditing || otpSent} />
                                                            </FormControl>
                                                            {!isPhoneVerified && isEditing && !otpSent && (
                                                                <Button type="button" variant="outline" onClick={handleSendOtp} disabled={isSendingOtp}>
                                                                    {isSendingOtp ? <Loader /> : 'Send OTP'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                                {otpSent && (
                                                    <div className="space-y-2 p-3 bg-muted rounded-md">
                                                        <Label htmlFor="otp">Enter OTP</Label>
                                                        <div className="flex gap-2">
                                                            <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="123456" />
                                                            <Button type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp}>
                                                                {isVerifyingOtp ? <Loader /> : 'Verify OTP'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                                                    <FormItem><FormLabel className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/>WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </div>
                                             <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id="same-as-contact"
                                                  onCheckedChange={(checked) => {
                                                    if (checked) {
                                                      setValue('whatsapp', phoneValue, { shouldDirty: true });
                                                    }
                                                  }}
                                                  disabled={!isEditing}
                                                />
                                                <Label htmlFor="same-as-contact" className="text-sm font-normal text-muted-foreground">WhatsApp number is the same as contact number</Label>
                                              </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="group-disabled:bg-muted/30">
                                        <CardHeader><CardTitle>Socials</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="socials.twitter" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Twitter className="h-4 w-4"/>Twitter</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="socials.instagram" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Instagram className="h-4 w-4"/>Instagram</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="socials.facebook" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Facebook className="h-4 w-4"/>Facebook</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="socials.linkedin" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Linkedin className="h-4 w-4"/>LinkedIn</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="socials.website" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4"/>Website</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="socials.telegram" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><AtSign className="h-4 w-4"/>Telegram</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </fieldset>
                    </CardContent>
                </Card>
            </form>
        </Form>
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes. Are you sure you want to discard them?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep Editing</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDiscard}>Yes, Discard</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Card>
            <CardHeader>
                <CardTitle>FAQs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What happens when I update my email address or mobile number?</AccordionTrigger>
                        <AccordionContent>
                        Your login credentials will change accordingly. All future communications, including order updates and OTPs, will be sent to your new email or mobile number.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>When will my account be updated with new details?</AccordionTrigger>
                        <AccordionContent>
                        Your account is updated instantly after you save your changes. If you update your mobile number, it will be updated after you successfully verify it with an OTP.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What happens to my existing account and orders when I update my profile?</AccordionTrigger>
                        <AccordionContent>
                        Updating your personal details does not affect your account's existence. Your account remains fully functional, and your order history, wishlist, and cart will stay intact.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
        
        <Card className="border-destructive">
            <CardHeader>
                <AlertTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Danger Zone</AlertTitle>
                <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h4 className="font-semibold">Deactivate Account</h4>
                        <p className="text-sm text-muted-foreground">Your account will be temporarily disabled. You can reactivate it by logging in again.</p>
                    </div>
                    <DangerZoneAction 
                        action="deactivate"
                        title="Are you sure you want to deactivate your account?"
                        description="Your account will be temporarily disabled, but your data will be saved. You can reactivate it anytime by simply logging back in."
                        buttonText="Deactivate Account"
                        onConfirm={handleDeactivate}
                    />
                </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h4 className="font-semibold">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data.</p>
                    </div>
                    <DangerZoneAction 
                        action="delete"
                        title="Are you sure you want to permanently delete your account?"
                        description="This action is irreversible. All your data, including order history and wishlist, will be permanently erased."
                        buttonText="Delete Account"
                        onConfirm={handleDeleteAccount}
                    />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
