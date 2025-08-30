import { forwardRef, ReactNode } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'default' | 'header';

type ButtonProps = {
  title?: string;
  children?: ReactNode;
  variant?: ButtonVariant;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, children, variant = 'default', className, ...touchableProps }, ref) => {
    const variantStyles = {
      default: {
        button: 'items-center bg-indigo-500 rounded-xl p-4',
        text: 'text-white text-lg font-semibold text-center',
      },
      header: {
        button: 'mr-2 rounded-lg px-3 py-2 bg-blue-500',
        text: 'font-semibold text-white',
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        className={cn(currentVariant.button, className)}>
        {children || <Text className={currentVariant.text}>{title}</Text>}
      </TouchableOpacity>
    );
  }
);
