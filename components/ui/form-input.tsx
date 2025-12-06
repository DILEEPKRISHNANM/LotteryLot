import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

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
  ...props
}: FormInputProps) {
  const inputId = register.name;

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
          {...register}
          {...props}
          className={`
            w-full px-4 py-3 border rounded-md 
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
        {error && (
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