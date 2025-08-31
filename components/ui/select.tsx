import { useId } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import { Label } from './label';

import { cn } from '@/lib/utils/cn';

interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface SelectProps<T = string> {
  label?: string;
  value: T;
  options: SelectOption<T>[] | readonly T[];
  onValueChange: (value: T) => void;
  error?: string;
  hasError?: boolean;
  getOptionLabel?: (option: T) => string;
}

export function Select<T = string>({
  label,
  value,
  options,
  onValueChange,
  error,
  hasError: hasErrorProps,
  getOptionLabel,
}: SelectProps<T>) {
  const id = useId();
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'object' && option !== null && 'value' in option && 'label' in option) {
      return option as SelectOption<T>;
    }
    return {
      value: option as T,
      label: getOptionLabel ? getOptionLabel(option as T) : String(option),
    };
  });

  const hasError = hasErrorProps || !!error;

  return (
    <View className="mb-6">
      {label && <Label>{label}</Label>}
      <View className="flex-row gap-3">
        {normalizedOptions.map((option, index) => (
          <TouchableOpacity
            key={`${id}-${index}`}
            className={cn(
              'flex-1 rounded-lg border p-3',
              value === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
              hasError && 'border-red-500'
            )}
            onPress={() => onValueChange(option.value)}>
            <Text
              className={cn(
                'text-center capitalize',
                value === option.value ? 'text-blue-700' : 'text-gray-700'
              )}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Label variant="error">{error}</Label>}
    </View>
  );
}
