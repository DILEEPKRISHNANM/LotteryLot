'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api/client';
import { FormInput } from '@/components/ui/form-input';
import { FormButton } from '@/components/ui/form-button';
import { loginSchema, type LoginFormData } from '@/lib/validations/schema';
import { toastSuccess, toastError } from '@/lib/utils/toast';
import { LoginResponse, UserProfile } from '@/types/clientResponseTypes';
import { API_AUTH_LOGIN_ENDPOINT, API_AUTH_ME_ENDPOINT } from '@/lib/utils/constants';
import { useEffect, useState, useRef } from 'react';
import { getCurrentRoute, isAuthRoute } from '@/lib/utils/nav';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false); // Prevent multiple checks

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    // Only check once on mount
    if (hasCheckedAuth.current) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      hasCheckedAuth.current = true;
      const accessToken = apiClient.getToken();
      const currentRoute = getCurrentRoute();
      const isauthRoute = isAuthRoute(currentRoute);

      // No token and we're on login page - just stop loading, don't make API call
      if (!accessToken) {
        setLoading(false);
        return;
      }

      // Only check auth if we have a token
      try {
        const response = await apiClient.get<UserProfile>(API_AUTH_ME_ENDPOINT);

        if (response.success && response.user) {
          // Redirect based on role
          if (response.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        // API call failed (401, etc.) - just stop loading, stay on login page
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await apiClient.post<LoginResponse>(API_AUTH_LOGIN_ENDPOINT, {
        username: data.username,
        password: data.password,
      });

      if (response.success && response.accessToken) {
        apiClient.setToken(response.accessToken);
        toastSuccess('Login successful! Redirecting...');

        setTimeout(() => {
          if (response.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }, 500);
      }
    } catch (err: any) {
      const erroStatus = err.response?.status;
      if(erroStatus === 401) {
        toastError('Invalid credentials. Please try again.');
      } else {
        toastError(err.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          LotteryLot Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <FormInput
            label="Username"
            type="email"
            register={register('username')}
            error={errors.username}
            placeholder="Enter your email"
            disabled={isSubmitting}
            required
          />

          <FormInput
            label="Password"
            type="password"
            register={register('password')}
            error={errors.password}
            placeholder="Enter your password"
            disabled={isSubmitting}
            required
          />

          <FormButton
            type="submit"
            loading={isSubmitting}
            fullWidth
            variant="primary"
            className="cursor-pointer"
          >
            Login
          </FormButton>
        </form>
      </div>
    </div>
  );
}