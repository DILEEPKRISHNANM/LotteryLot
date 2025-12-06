import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export function FormButton({
  children,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: FormButtonProps) {
  const baseStyles =
    'px-6 py-3 rounded-md font-semibold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 className="animate-spin" size={20} />}
      {children}
    </button>
  );
}