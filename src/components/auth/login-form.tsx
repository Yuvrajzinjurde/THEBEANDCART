
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
import type { IBrand } from "@/models/brand.model";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { Logo } from "../logo";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings, fetchSettings } = usePlatformSettingsStore();
  const { login } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [brandName, setBrandName] = useState('reeva');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
        await fetchSettings();
        const urlBrand = searchParams.get('brand');
        if (urlBrand) {
            setBrandName(urlBrand);
        }
        setLoading(false);
    }
    initialize();
  }, [fetchSettings, searchParams]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      brand: brandName,
    },
  });
  
  useEffect(() => {
    form.setValue('brand', brandName);
  }, [brandName, form]);

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);
    setError(null);
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
      
      // Await the login function which now returns a promise
      await login(result.user, result.token);

      toast.success(`Welcome back, ${result.user.firstName}!`);

      const redirectUrl = searchParams.get('redirect');

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (result.user.roles.includes('admin')) {
        router.push("/admin/dashboard");
      } else {
        const userBrand = result.user.brand || 'reeva';
        router.push(`/${userBrand}/home`);
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      setError(error.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container flex flex-1 items-center justify-center p-4">
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="items-center text-center">
        {loading ? (
          <Skeleton className="h-14 w-14 rounded-full" />
        ) : settings?.platformLogoUrl ? (
            <div className="relative h-14 w-14 rounded-full">
                <Image src={settings.platformLogoUrl} alt="Logo" fill className="object-cover" />
            </div>
        ) : (
            <Logo className="h-14 w-14" />
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
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader className="mr-2 h-4 w-4" />
              )}
              Log In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup`}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
         <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or
                </span>
            </div>
        </div>
        <Button variant="outline" className="w-full" asChild>
            <Link href="/">Continue Shopping</Link>
        </Button>
      </CardFooter>
    </Card>
    </main>
  );
}

    