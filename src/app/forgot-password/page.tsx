import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { GlobalFooter } from "@/components/global-footer";

export default function ForgotPasswordPage() {
  return (
    <>
      <main className="flex flex-1 items-center justify-center p-4">
        <ForgotPasswordForm />
      </main>
      <GlobalFooter />
    </>
  );
}
