
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until authentication state is loaded

    if (user) {
      const isAdmin = user.roles.includes('admin');
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);
  
  // This is a temporary solution to allow seeding the database.
  const handleSeed = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      alert('Database seeded!');
    } catch (error) {
      alert('Failed to seed database.');
    }
  };

  // While checking auth or redirecting, show a loader.
  if (loading || user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </main>
    );
  }

  // If not logged in, show the landing page.
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
          Welcome to Reeva
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl">
          Seamlessly secure your application with our modern authentication solution, featuring AI-powered password analysis.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
       <div className="absolute bottom-4 right-4">
        <Button onClick={handleSeed} variant="outline">
          Seed Database
        </Button>
      </div>
    </main>
  );
}
