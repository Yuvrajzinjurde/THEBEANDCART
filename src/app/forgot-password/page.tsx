
"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

function ForgotPasswordPageContent() {
    return (
        <main className="container flex flex-1 items-center justify-center p-4">
            <ForgotPasswordForm />
        </main>
    )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center">
            <Loader className="h-8 w-8" />
        </div>
    }>
        <ForgotPasswordPageContent />
    </Suspense>
  );
}
