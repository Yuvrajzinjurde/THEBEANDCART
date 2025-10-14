
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
import { UploadCloud, X, Save, Edit, Twitter, Instagram, Facebook, Linkedin, Link as LinkIcon, AtSign, Phone, MessageSquare, ShieldCheck, AlertTriangle, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";
import { useForm, type FieldValues } from "react-hook-form";
import type { IUser } from "@/models/user.model";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";


const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});


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

  const handleInitialConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user?.phone || !user.isPhoneVerified) {
      toast.error("You must have a verified phone number to perform this action.");
      setIsOpen(false);
      return;
    }
    setIsSubmitting(true);
    try {
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: user.phone })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setStep('otp');
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFinalConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when dialog is closed
      setTimeout(() => {
        setStep('initial');
        setOtp('');
      }, 300); // Delay to allow animation
    }
    setIsOpen(open);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant={action === 'delete' ? 'destructive' : 'outline'} className={cn("w-full sm:w-48 justify-center", action === 'deactivate' ? 'border-destructive text-destructive hover:bg-destructive/5' : '')}>
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{step === 'initial' ? title : 'Enter OTP to Confirm'}</AlertDialogTitle>
          <AlertDialogDescription>
            {step === 'initial' && description}
            {step === 'otp' && <>An OTP has been sent to your phone. Please enter the 6-digit code to finalize this action. <span className='text-xs'>(Hint: use 123456)</span></>}
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {step === 'initial' ? (
            <AlertDialogAction onClick={handleInitialConfirm} disabled={isSubmitting}>
              {isSubmitting ? <Loader className="mr-2 h-4 w-4"/> : null}
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

  // States for phone verification
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  // States for inline password change
  const [passwordChangeStep, setPasswordChangeStep] = useState<'initial' | 'otp' | 'password'>('initial');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [isSubmittingPasswordChange, setIsSubmittingPasswordChange] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });


  const profileForm = useForm({
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

  const passwordForm = useForm({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }
  });


  const { formState: { isDirty }, reset, watch, setValue } = profileForm;

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

  const handleSaveChanges = profileForm.handleSubmit(async (data: FieldValues) => {
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

    const handleSendPasswordOtp = async () => {
        if (!user?.phone || !user.isPhoneVerified) {
            toast.error("A verified phone number is required to change your password.");
            return;
        }
        setIsSubmittingPasswordChange(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: user.phone })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            setPasswordChangeStep('otp');
            toast.success("OTP sent to your verified phone number.");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmittingPasswordChange(false);
        }
    };

    const handleVerifyPasswordOtp = async () => {
        if (passwordOtp !== '123456') {
            toast.error("Invalid OTP. Please try again.");
            return;
        }
        setPasswordChangeStep('password');
    };

    const onSubmitPasswordChange = passwordForm.handleSubmit(async (data) => {
        setIsSubmittingPasswordChange(true);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            toast.success("Password changed successfully!");
            setPasswordChangeStep('initial');
            passwordForm.reset();
            setPasswordOtp('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmittingPasswordChange(false);
        }
    });

    const toggleShowPassword = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    }

  return (
    <div className="space-y-6">
        <Form {...profileForm}>
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
                                <Button type="submit" onClick={handleSaveChanges} disabled={isSubmitting || !isDirty}>
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

                                            {/* Inline Password Change */}
                                            <div className="space-y-4">
                                                {passwordChangeStep === 'initial' && (
                                                    <Button className="w-full" type="button" onClick={handleSendPasswordOtp} disabled={isSubmittingPasswordChange}>
                                                         {isSubmittingPasswordChange && <Loader className="mr-2 h-4 w-4" />}
                                                        <Lock className="mr-2 h-4 w-4" /> Change Password
                                                    </Button>
                                                )}

                                                {passwordChangeStep === 'otp' && (
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-muted-foreground">An OTP has been sent to your verified phone number.</p>
                                                        <FormItem>
                                                            <FormLabel>OTP</FormLabel>
                                                            <FormControl>
                                                                <Input value={passwordOtp} onChange={(e) => setPasswordOtp(e.target.value)} placeholder="Enter 6-digit OTP (123456)" />
                                                            </FormControl>
                                                        </FormItem>
                                                        <div className="flex gap-2">
                                                          <Button type="button" variant="outline" className="w-full" onClick={() => {setPasswordChangeStep('initial'); setPasswordOtp('')}}>Cancel</Button>
                                                          <Button type="button" className="w-full" onClick={handleVerifyPasswordOtp}>
                                                            Verify OTP
                                                          </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {passwordChangeStep === 'password' && (
                                                  <Form {...passwordForm}>
                                                    <div className="space-y-4">
                                                        <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Current Password</FormLabel>
                                                                <div className="relative"><FormControl><Input type={showPasswords.current ? "text" : "password"} {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => toggleShowPassword('current')}>{showPasswords.current ? <EyeOff/> : <Eye/>}</Button></div>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}/>
                                                        <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>New Password</FormLabel>
                                                                <div className="relative"><FormControl><Input type={showPasswords.new ? "text" : "password"} {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => toggleShowPassword('new')}>{showPasswords.new ? <EyeOff/> : <Eye/>}</Button></div>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}/>
                                                        <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Confirm New Password</FormLabel>
                                                                <div className="relative"><FormControl><Input type={showPasswords.confirm ? "text" : "password"} {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => toggleShowPassword('confirm')}>{showPasswords.confirm ? <EyeOff/> : <Eye/>}</Button></div>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}/>
                                                        <div className="flex gap-2">
                                                            <Button type="button" variant="outline" className="w-full" onClick={() => {setPasswordChangeStep('initial'); passwordForm.reset(); setPasswordOtp('');}}>Cancel</Button>
                                                            <Button type="button" onClick={onSubmitPasswordChange} className="w-full" disabled={isSubmittingPasswordChange}>
                                                                {isSubmittingPasswordChange && <Loader className="mr-2 h-4 w-4" />}
                                                                Save Password
                                                            </Button>
                                                        </div>
                                                    </div>
                                                   </Form>
                                                )}
                                            </div>


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
                                                <FormField control={profileForm.control} name="nickname" render={({ field }) => (
                                                  <FormItem><FormLabel>Nickname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                                                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                                                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <div className="md:col-span-2">
                                                    <FormField control={profileForm.control} name="displayName" render={({ field }) => (
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
                                                <FormField control={profileForm.control} name="phone" render={({ field }) => (
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
                                                <FormField control={profileForm.control} name="whatsapp" render={({ field }) => (
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
                                            <FormField control={profileForm.control} name="socials.twitter" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Twitter className="h-4 w-4"/>Twitter</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={profileForm.control} name="socials.instagram" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Instagram className="h-4 w-4"/>Instagram</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={profileForm.control} name="socials.facebook" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Facebook className="h-4 w-4"/>Facebook</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={profileForm.control} name="socials.linkedin" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><Linkedin className="h-4 w-4"/>LinkedIn</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={profileForm.control} name="socials.website" render={({ field }) => (
                                                <FormItem><FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4"/>Website</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={profileForm.control} name="socials.telegram" render={({ field }) => (
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
