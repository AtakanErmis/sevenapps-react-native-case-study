import { TouchableOpacity, View, Text } from 'react-native';

import { SortSelector } from '@/components/ui/sort-selector';
import { sortOptions } from '@/constants/filterConfig';
import { useTaskFilters, SortBy } from '@/lib/hooks/useTaskFilters';

interface SortPanelProps {
  showSort: boolean;
}

export function SortPanel({ showSort }: SortPanelProps) {
  const filters = useTaskFilters();

  if (!showSort) return null;

  return (
    <View className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700">Sort by:</Text>
        {filters.hasActiveSort && (
          <TouchableOpacity onPress={filters.resetSort} testID="reset-sort">
            <Text className="text-sm text-red-600">Reset</Text>
          </TouchableOpacity>
        )}
      </View>
      <SortSelector
        sortOptions={sortOptions}
        selectedSort={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSortChange={(sort) => filters.setSortBy(sort as SortBy)}
        onOrderToggle={filters.toggleSortOrder}
        testID="sort-selector"
      />
    </View>
  );
}
