'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api/client';
import { FormInput } from '@/components/ui/form-input';
import { FormButton } from '@/components/ui/form-button';
import { loginSchema, type LoginFormData } from '@/lib/validations/schema';
import { toastSuccess, toastError } from '@/lib/utils/toast';
import { LoginResponse } from '@/types/clientResponseTypes';

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth', {
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
            register={register('username')}
            error={errors.username}
            placeholder="Enter your username"
            disabled={isSubmitting}
            required
            autoComplete="username"
          />

          <FormInput
            label="Password"
            type="password"
            register={register('password')}
            error={errors.password}
            placeholder="Enter your password"
            disabled={isSubmitting}
            required
            autoComplete="current-password"
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