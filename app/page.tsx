'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { UserProfile } from '@/types/clientResponseTypes';
import { API_AUTH_ME_ENDPOINT } from '@/lib/utils/constants';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = apiClient.getToken();

      // No token, redirect to login
      if (!accessToken) {
        router.push('/login');
        return;
      }

      try {
        // Call /api/auth/me to get user profile
        const response = await apiClient.get<UserProfile>(API_AUTH_ME_ENDPOINT);

        if (response.success && response.user) {
          // Redirect based on role
          if (response.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        // API call failed (401, etc.) - redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return null;
}