'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { UserProfile } from '@/types/clientResponseTypes';
import { API_AUTH_ME_ENDPOINT } from '@/lib/utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = apiClient.getToken();

      // No token, redirect to login
      if (!accessToken) {
        router.push('/login');
        return;
      }

      try {
        // Verify token is valid
        const response = await apiClient.get<UserProfile>(API_AUTH_ME_ENDPOINT);

        if (response?.success && response?.user) {
          // Check role if required
          if (requiredRole && response.user.role !== requiredRole) {
            // User doesn't have required role, redirect
            router.push(redirectTo || '/dashboard');
            return;
          }

          // User is authorized
          setIsAuthorized(true);
        } else {
          // Invalid response, redirect to login
          router.push('/login');
        }
      } catch (error) {
        // Token is invalid or expired, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole, redirectTo]);

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}