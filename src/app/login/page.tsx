
"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

function LoginPageContent() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <LoginForm />
        </main>
    )
}


export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center">
            <Loader className="h-8 w-8" />
        </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
