

"use client";

import { SignUpForm } from "@/components/auth/signup-form";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

function SignUpPageContent() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <SignUpForm />
        </main>
    )
}


export default function SignUpPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center">
            <Loader className="h-8 w-8" />
        </div>
    }>
      <SignUpPageContent />
    </Suspense>
  );
}
