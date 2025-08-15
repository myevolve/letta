'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { Progress } from '@/components/ui/progress';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      // Show a loading spinner or skeleton screen while checking auth state.
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900">
            <div className="w-1/4">
                <p className="text-center text-white mb-4">Loading...</p>
                <Progress value={33} className="w-full" />
            </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Return null or a loader while redirecting
      return null;
    }

    return (
      <MainLayout>
        <WrappedComponent {...props} />
      </MainLayout>
    );
  };

  AuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return AuthComponent;
};

export default withAuth;
