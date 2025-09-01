import Feather from '@expo/vector-icons/Feather';
import { TouchableOpacity, View, Text } from 'react-native';

import { useTaskFilters } from '@/lib/hooks/useTaskFilters';

interface FilterControlsProps {
  showFilters: boolean;
  showSort: boolean;
  onToggleFilters: () => void;
  onToggleSort: () => void;
}

export function FilterControls({
  showFilters,
  showSort,
  onToggleFilters,
  onToggleSort,
}: FilterControlsProps) {
  const filters = useTaskFilters();

  return (
    <View className="mb-3 flex-row gap-2">
      <TouchableOpacity
        onPress={onToggleFilters}
        className="flex-1 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3"
        testID="filter-toggle">
        <View className="flex-row items-center">
          <Feather name="filter" size={20} className="text-gray-600" />
          <Text className="ml-2 font-medium text-gray-700">
            Filters
            {filters.hasActiveFilters && <Text className="text-blue-600"> (active)</Text>}
          </Text>
        </View>
        <Feather
          name={showFilters ? 'chevron-up' : 'chevron-down'}
          size={20}
          className="text-gray-600"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleSort}
        className="flex-1 flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3"
        testID="sort-toggle">
        <View className="flex-row items-center">
          <Feather name="list" size={20} className="text-gray-600" />
          <Text className="ml-2 font-medium text-gray-700">
            Sort
            {filters.hasActiveSort && <Text className="text-blue-600"> (active)</Text>}
          </Text>
        </View>
        <Feather
          name={showSort ? 'chevron-up' : 'chevron-down'}
          size={20}
          className="text-gray-600"
        />
      </TouchableOpacity>
    </View>
  );
}
