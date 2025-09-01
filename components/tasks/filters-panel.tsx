import { TouchableOpacity, View, Text } from 'react-native';

import { FilterChips } from '@/components/ui/filter-chips';
import { priorityChips, statusChips } from '@/constants/filterConfig';
import { useTaskFilters } from '@/lib/hooks/useTaskFilters';

interface FiltersPanelProps {
  showFilters: boolean;
}

export function FiltersPanel({ showFilters }: FiltersPanelProps) {
  const filters = useTaskFilters();

  if (!showFilters) return null;

  return (
    <View className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">Priority:</Text>
          {filters.priorityFilter && (
            <TouchableOpacity onPress={filters.clearPriorityFilter} testID="clear-priority-filter">
              <Text className="text-sm text-red-600">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <FilterChips
          chips={priorityChips}
          selectedValue={filters.priorityFilter}
          onSelect={filters.setPriorityFilter}
          testID="priority-filter"
        />
      </View>

      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">Status:</Text>
          {filters.statusFilter && (
            <TouchableOpacity onPress={filters.clearStatusFilter} testID="clear-status-filter">
              <Text className="text-sm text-red-600">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <FilterChips
          chips={statusChips}
          selectedValue={filters.statusFilter}
          onSelect={filters.setStatusFilter}
          testID="status-filter"
        />
      </View>

      {filters.hasActiveFilters && (
        <TouchableOpacity
          onPress={filters.clearAllFilters}
          className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2"
          testID="clear-all-filters">
          <Text className="text-center text-sm font-medium text-red-600">Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
