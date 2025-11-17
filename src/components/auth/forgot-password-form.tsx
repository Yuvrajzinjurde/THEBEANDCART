
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ForgotPasswordSchema, ResetPasswordSchema, type ForgotPasswordInput, type ResetPasswordInput } from "@/lib/auth";
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
import { Loader } from "../ui/loader";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import Image from "next/image";

type FormStep = "email" | "reset";
type CombinedFormData = ForgotPasswordInput & ResetPasswordInput;

export function ForgotPasswordForm() {
  const router = useRouter();
  const { settings } = usePlatformSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<FormStep>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentSchema = step === 'email' ? ForgotPasswordSchema : ResetPasswordSchema;

  const form = useForm<CombinedFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: { 
      email: "",
      otp: "", 
      newPassword: "", 
      confirmPassword: "" 
    },
  });

  async function onSubmit(data: CombinedFormData) {
    if (step === 'email') {
      await onEmailSubmit(data);
    } else {
      await onResetSubmit(data);
    }
  }

  async function onEmailSubmit(data: ForgotPasswordInput) {
    setIsSubmitting(true);
    // In a real app, you'd call an API. Here we just move to the next step.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // We keep the email in the form state, but move to the next step
    setStep("reset");
    setIsSubmitting(false);
    toast.info("Please enter the OTP and your new password.");
  }
  
  async function onResetSubmit(data: ResetPasswordInput) {
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.getValues('email'), otp: data.otp, newPassword: data.newPassword }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'An error occurred');
        }

        toast.success("Password has been reset successfully. You can now log in.");
        router.push(`/login`);

    } catch (error: any) {
      console.error("Password Reset Error:", error);
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
       <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <CardHeader className="items-center text-center">
              {settings?.platformLogoUrl ? (
                <Image src={settings.platformLogoUrl} alt="Logo" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                  <div className="h-14 w-14 rounded-full bg-muted" />
              )}
              <CardTitle className="text-2xl font-bold">
                {step === 'email' ? 'Forgot Password?' : 'Reset Your Password'}
              </CardTitle>
              <CardDescription>
                 {step === 'email' 
                    ? "No worries, we'll help you reset it."
                    : "Enter the OTP (use 123456) and set a new password."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === "email" ? (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password (OTP)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter OTP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                          </FormControl>
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(p => !p)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                          </FormControl>
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(p => !p)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                {step === 'email' ? 'Continue' : 'Reset Password'}
              </Button>
            </CardContent>
             <CardFooter className="justify-center">
                {step === 'email' ? (
                     <Button variant="link" asChild className="p-0 text-sm text-muted-foreground">
                        <Link href={`/login`} className="font-medium text-primary hover:underline">
                        Back to Log in
                        </Link>
                    </Button>
                ) : (
                    <Button variant="link" asChild className="p-0 text-sm text-muted-foreground" onClick={() => {
                        setStep('email');
                        form.reset(); // Reset form state when going back
                    }}>
                        <Link href="#" className="font-medium text-primary hover:underline">
                        Back to email entry
                        </Link>
                    </Button>
                )}
            </CardFooter>
          </form>
        </Form>
    </Card>
  );
}

    