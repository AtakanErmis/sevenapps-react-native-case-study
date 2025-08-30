import { View, TextInput as RNTextInput, TextInputProps } from 'react-native';

import { Label } from './label';

import { cn } from '@/lib/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isError?: boolean;
  required?: boolean;
}

export function Input({ label, error, isError, required, className, ...props }: InputProps) {
  const multiline = props.multiline || false;
  return (
    <View className="mb-4">
      {label && <Label required={required}>{label}</Label>}
      <RNTextInput
        className={cn(
          'rounded-lg border border-gray-300 px-3 text-lg',
          multiline ? 'h-24 py-3 text-left' : 'h-12',
          isError && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <Label variant="error">{error}</Label>}
    </View>
  );
}
