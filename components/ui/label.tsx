import { Text } from 'react-native';

import { cn } from '@/lib/utils/cn';

interface LabelProps {
  children: string;
  required?: boolean;
  className?: string;
  variant?: 'default' | 'error';
}

export function Label({ children, required, className, variant = 'default' }: LabelProps) {
  const baseStyles = 'font-medium';
  const variantStyles = {
    default: 'mb-2 text-lg text-gray-900',
    error: 'mt-1 text-sm text-red-600',
  };

  return (
    <Text className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
      {required && variant === 'default' && '*'}
    </Text>
  );
}
