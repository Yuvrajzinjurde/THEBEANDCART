
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
<<<<<<< HEAD
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { toast } from "react-toastify";
=======
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

import { SignUpSchema, type SignUpInput } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordStrength } from "./password-strength";
import { Loader } from "../ui/loader";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import Image from "next/image";

type FormStep = 'details' | 'otp';

export function SignUpForm() {
  const router = useRouter();
<<<<<<< HEAD
  const params = useParams();
  const searchParams = useSearchParams();
  const brand = params.brand as string || 'reeva';
  
=======
  const { settings } = usePlatformSettingsStore();
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [step, setStep] = useState<FormStep>('details');
  const [otpForVerification, setOtpForVerification] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [signUpToken, setSignUpToken] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || null;

  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
<<<<<<< HEAD
      brand: brand,
=======
      brand: "reeva", // Default brand for new signups
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
    },
    mode: 'onChange',
  });

  const password = form.watch("password");

  async function handleDetailsSubmit(data: SignUpInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.firstName }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP.');
      }
<<<<<<< HEAD
      toast.success(`An OTP has been sent to ${data.email}.`);
      setOtpForVerification(result.otpForVerification); // Store the static OTP for client-side check
      setStep('otp');
=======

      toast.success("Account created successfully. Please log in.");
      router.push(`/login`);
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleOtpSubmit() {
    if (enteredOtp.length !== 6) {
        toast.warn("Please enter the 6-digit OTP.");
        return;
    }
    
    // In a real app, you would not have the OTP on the client.
    // This client-side check is a stand-in for the real server-side verification.
    if (enteredOtp !== otpForVerification) {
        toast.error("Invalid OTP. Please try again.");
        return;
    }

    setIsSubmitting(true);
    try {
        // Since the OTP is valid, now we can create the user account
        const formData = form.getValues();
        // A real app would use a server-side verified token from a /verify-otp call.
        // For now, we'll send all data. I will improve this in a future step.
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            signUpToken: "dummy-token-replace-with-jwt-from-verify-otp"
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        toast.success("Account created successfully! Please log in.");
        router.push(`/login${callbackUrl ? `?callbackUrl=${callbackUrl}`: ''}`);
    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsSubmitting(false);
    }
  }


  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
<<<<<<< HEAD
        <Logo />
        <CardTitle className="text-2xl font-bold">
          {step === 'details' ? 'Create an Account' : 'Verify Your Email'}
        </CardTitle>
        <CardDescription>
          {step === 'details' 
            ? "Get started by creating your account."
            : `We've sent a 6-digit code to ${form.getValues('email')}.`}
=======
        {settings?.platformLogoUrl ? (
            <div className="relative h-14 w-14 rounded-full">
                <Image src={settings.platformLogoUrl} alt="Logo" fill className="object-cover" />
            </div>
        ) : (
            <div className="h-14 w-14 rounded-full bg-muted" />
        )}
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>
          Get started with your new account.
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'details' ? (
             <Form {...form}>
              <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-4">
                <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem className="hidden"><Input {...field} /></FormItem> )}/>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} /></FormControl>
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}/>
                <PasswordStrength password={password} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl><Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} /></FormControl>
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(p => !p)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                  Continue
                </Button>
              </form>
            </Form>
        ) : (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} placeholder="••••••" maxLength={6} />
                </div>
                <Button onClick={handleOtpSubmit} className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                  <MailCheck className="mr-2 h-4 w-4" /> Create Account
                </Button>
                 <Button variant="link" size="sm" className="w-full" onClick={() => setStep('details')}>Back to details</Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
<<<<<<< HEAD
          <Link href={`/login${callbackUrl ? `?callbackUrl=${callbackUrl}`: ''}`} className="font-medium text-primary hover:underline">
=======
          <Link
            href={`/login`}
            className="font-medium text-primary hover:underline"
          >
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

    