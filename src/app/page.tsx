
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/ui/loader';

// This is a temporary redirect page.
// It will redirect users to the default brand's homepage.
export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // TODO: In the future, this could be dynamic based on user location or other factors.
    // For now, we redirect to the default "reeva" brand.
    router.replace('/reeva/home');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Loader className="h-12 w-12" />
      <p className="mt-4 text-muted-foreground">Redirecting to our store...</p>
    </main>
  );
}
