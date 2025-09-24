
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

import { LoginSchema, type LoginInput } from "@/lib/auth";
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
import Image from "next/image";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { useAuth } from "@/hooks/use-auth";

interface DecodedToken {
  roles: string[];
  brand?: string;
}

export function LoginForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const { settings: platformSettings } = usePlatformSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const callbackUrl = searchParams.get('callbackUrl') || null;

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      brand: 'reeva'
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "An error occurred during login.");
      }
      
      login(result.token);

      toast.success(`Welcome back, ${result.name}!`);
      
      router.refresh();

      if (callbackUrl) {
          router.push(callbackUrl);
          return;
      }

      // Decode token to get roles and redirect
      const decoded = jwtDecode<DecodedToken>(result.token);
      if (decoded.roles.includes('admin')) {
        router.push("/admin/dashboard");
      } else {
        const userBrand = decoded.brand || 'reeva'; // Default to reeva if no brand
        router.push(`/${userBrand}/home`);
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        {platformSettings?.platformLogoUrl ? (
            <Image src={platformSettings.platformLogoUrl} alt="Logo" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
        ) : (
            <div className="h-14 w-14 rounded-full bg-muted" />
        )}
        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href={`/forgot-password`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader className="mr-2 h-4 w-4" />
              )}
              Log In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${callbackUrl ? `?callbackUrl=${callbackUrl}`: ''}`}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
