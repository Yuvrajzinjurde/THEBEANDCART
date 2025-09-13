
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[]
) => {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace('/login');
        } else {
          const userRoles = user.roles || [];
          const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
          if (!hasRequiredRole) {
            // Redirect to a more appropriate page based on role
             if (userRoles.includes('admin')) {
              router.replace('/admin/dashboard');
            } else {
              router.replace('/dashboard');
            }
          } else {
            setIsAuthorized(true);
          }
        }
      }
    }, [user, loading, router, allowedRoles]);

    if (loading || !isAuthorized) {
       return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  Wrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default withAuth;
