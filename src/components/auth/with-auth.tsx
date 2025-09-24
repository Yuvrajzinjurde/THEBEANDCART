
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from '../ui/loader';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[]
) => {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    useEffect(() => {
      if (loading) {
        return; // Wait for the auth state to be determined
      }

      if (!user) {
        // If not logged in, redirect to global login page with a callback
        router.replace(`/login?callbackUrl=${pathname}`);
        return;
      }

      const userRoles = user.roles || [];
      const isAuthorized = allowedRoles.some(role => userRoles.includes(role));

      if (!isAuthorized) {
        // If user is logged in but doesn't have the right role, redirect them
        if (userRoles.includes('admin')) {
          router.replace('/admin/dashboard');
        } else {
          // Redirect to main homepage as a default for unauthorized users
          router.replace('/');
        }
      }
    }, [user, loading, router, pathname]);

    // While loading or if user is not yet determined, show a loader
    if (loading || !user) {
       return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader className="h-8 w-8" />
        </div>
      );
    }
    
    // If authorized, render the component
    const isAuthorized = allowedRoles.some(role => user.roles.includes(role));
    if (isAuthorized) {
      return <WrappedComponent {...props} />;
    }

    // If not authorized, show a loader while redirecting
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader className="h-8 w-8" />
        </div>
    );
  };

  Wrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default withAuth;
