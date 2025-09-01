import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

import { cn } from '@/lib/utils/cn';

interface SortOption {
  id: string;
  label: string;
  value: string;
}

interface SortSelectorProps {
  sortOptions: SortOption[];
  selectedSort: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sort: string) => void;
  onOrderToggle: () => void;
  testID?: string;
}

export function SortSelector({
  sortOptions,
  selectedSort,
  sortOrder,
  onSortChange,
  onOrderToggle,
  testID,
}: SortSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-2" testID={testID}>
      {sortOptions.map((option) => {
        const isSelected = selectedSort === option.value;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSortChange(option.value)}
            className={cn(
              'flex-row items-center rounded-full border px-3 py-2',
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
            )}
            testID={`${testID}-${option.id}`}>
            <Text
              className={cn('text-sm font-medium', isSelected ? 'text-blue-700' : 'text-gray-700')}>
              {option.label}
            </Text>
            {isSelected && (
              <TouchableOpacity
                onPress={onOrderToggle}
                className="ml-2"
                testID={`${testID}-order-toggle`}>
                <Feather
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color="#1D4ED8"
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
