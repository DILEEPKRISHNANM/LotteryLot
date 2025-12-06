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
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  useEffect(()=>{
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

  },[router])

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
      toastError(err.message || 'Login failed. Please check your credentials.');
    }
  };

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
            loading={isSubmitting}  // ✅ This disables the button automatically
            fullWidth
            variant="primary"
          >
            Login
          </FormButton>
        </form>
      </div>
    </div>
  );
}