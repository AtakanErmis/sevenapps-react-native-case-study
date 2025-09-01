import { useTaskFiltersSelectors } from '@/store/task-filters';

export type { SortBy, SortOrder } from '@/store/task-filters';

export function useTaskFilters() {
  return useTaskFiltersSelectors();
}
