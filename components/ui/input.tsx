import { View, TextInput as RNTextInput, TextInputProps } from 'react-native';

import { Label } from './label';

import { cn } from '@/lib/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hasError?: boolean;
  required?: boolean;
}

export function Input({
  label,
  error,
  hasError: hasErrorProps,
  required,
  className,
  ...props
}: InputProps) {
  const hasError = hasErrorProps || !!error;
  const multiline = props.multiline || false;
  return (
    <View className="mb-4">
      {label && <Label required={required}>{label}</Label>}
      <RNTextInput
        className={cn(
          'rounded-lg border border-gray-300 px-3 text-lg',
          multiline ? 'h-24 py-3 text-left' : 'h-12',
          hasError && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <Label variant="error">{error}</Label>}
    </View>
  );
}
