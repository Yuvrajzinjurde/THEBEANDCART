
"use client";

import { useEffect } from 'react';
<<<<<<< HEAD
import { useRouter, usePathname } from 'next/navigation';
=======
import { usePathname, useRouter } from 'next/navigation';
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
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
<<<<<<< HEAD
        // If not logged in, redirect to global login page with a callback
        router.replace(`/login?callbackUrl=${pathname}`);
=======
        // If not logged in, redirect to login page with the current path as a redirect parameter
        router.replace(`/login?redirect=${pathname}`);
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
        return;
      }

      const userRoles = user.roles || [];
      const isAuthorized = allowedRoles.some(role => userRoles.includes(role));

      if (!isAuthorized) {
        // If user is logged in but doesn't have the right role, redirect them
        if (userRoles.includes('admin')) {
          router.replace('/admin/dashboard');
        } else {
<<<<<<< HEAD
          // Redirect to main homepage as a default for unauthorized users
          router.replace('/');
        }
      }
    }, [user, loading, router, pathname, allowedRoles]);
=======
          router.replace('/');
        }
      }
    }, [user, loading, router, pathname]);
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

    // While loading or if user is not yet determined, show a loader
    if (loading || !user) {
       return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader className="h-8 w-8" />
        </div>
      );
    }
    
    // If authorized, render the component
    const isAuthorized = user && allowedRoles.some(role => user.roles.includes(role));
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
