import Feather from '@expo/vector-icons/Feather';
import { ReactNode } from 'react';
import { View, TextInput as RNTextInput, TextInputProps, TouchableOpacity } from 'react-native';

import { Label } from './label';

import { cn } from '@/lib/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hasError?: boolean;
  required?: boolean;
  variant?: 'small' | 'default';
  left?: ReactNode;
  right?: ReactNode;
  showClearButton?: boolean;
}

export function Input({
  label,
  error,
  hasError: hasErrorProps,
  required,
  variant = 'default',
  left,
  right,
  showClearButton,
  className,
  ...props
}: InputProps) {
  const hasError = hasErrorProps || !!error;
  const multiline = props.multiline || false;
  return (
    <View className={cn(className)}>
      {label && <Label required={required}>{label}</Label>}
      <View className="flex-row items-center gap-3">
        {left}
        <RNTextInput
          className={cn(
            'flex-1 rounded-lg border border-gray-300 px-3',
            multiline ? 'h-24 py-3 text-left' : 'h-12',
            hasError && 'border-red-500',
            variant === 'small' ? 'text-md h-10' : 'h-12 text-lg'
          )}
          {...props}
        />
        {right}
        {showClearButton && props.value && (
          <TouchableOpacity onPress={() => props.onChangeText?.('')}>
            <Feather name="x" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Label variant="error">{error}</Label>}
    </View>
  );
}
