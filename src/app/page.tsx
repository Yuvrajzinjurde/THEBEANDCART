import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-6 text-center">
        <Logo />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
            Welcome to Reeva
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Seamlessly secure your application with our modern authentication solution, featuring AI-powered password analysis.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
