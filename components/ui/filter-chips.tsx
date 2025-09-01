import { ScrollView, Text, TouchableOpacity } from 'react-native';

import { cn } from '@/lib/utils/cn';

interface FilterChip {
  id: string;
  label: string;
  value: string | null;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  testID?: string;
}

export function FilterChips({ chips, selectedValue, onSelect, testID }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      testID={testID}>
      {chips.map((chip) => {
        const isSelected = selectedValue === chip.value;
        return (
          <TouchableOpacity
            key={chip.id}
            onPress={() => onSelect(chip.value)}
            className={cn(
              'rounded-full px-4 py-2',
              isSelected ? 'bg-blue-500' : 'border border-gray-300 bg-white'
            )}
            testID={`${testID}-${chip.id}`}>
            <Text
              className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-gray-700')}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
