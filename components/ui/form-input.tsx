'use client';

import { useState } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  register: UseFormRegisterReturn;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  register,
  helperText,
  className = '',
  type,
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = register.name;
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium mb-1 text-gray-700"
      >
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          {...register}
          {...props}
          className={`
            w-full px-4 py-3 ${isPassword ? 'pr-12' : ''} border rounded-md 
            focus:outline-none focus:ring-2 transition
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
        />
        
        {/* Password toggle icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Error icon (only show if not password field) */}
        {error && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          {error.message}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}