import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

import { Label } from './label';

import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/date';

interface DatePickerProps {
  label: string;
  value?: string;
  onDateChange: (date?: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  hasError?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function DatePicker({
  label,
  value,
  onDateChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  hasError = false,
  error,
  required = false,
  disabled = false,
  testID,
}: DatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateSelect = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onDateChange(dateString);
    }
  };

  const handleClearDate = () => {
    onDateChange(undefined);
  };

  return (
    <View className="mb-4" testID={testID}>
      <View className="flex-row items-center justify-between">
        <Label required={required}>{label}</Label>
        {value && !disabled && (
          <TouchableOpacity
            className="mt-2 self-start"
            onPress={handleClearDate}
            testID={`${testID}-clear`}>
            <Text className="text-sm text-red-600">Clear date</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        className={cn(
          'flex-row items-center justify-between rounded-lg border bg-white p-4',
          hasError ? 'border-red-500' : 'border-gray-300',
          disabled && 'bg-gray-100 opacity-50'
        )}
        onPress={() => !disabled && setShowDatePicker(!showDatePicker)}
        disabled={disabled}
        testID={`${testID}-button`}>
        <Text className={cn(hasError ? 'text-red-900' : value ? 'text-gray-900' : 'text-gray-500')}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Feather name="calendar" size={20} color={hasError ? '#dc2626' : '#9CA3AF'} />
      </TouchableOpacity>

      {hasError && error && (
        <Text className="mt-1 text-sm text-red-600" testID={`${testID}-error`}>
          {error}
        </Text>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="spinner"
          onChange={handleDateSelect}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          testID={`${testID}-picker`}
        />
      )}
    </View>
  );
}
