import { create } from 'zustand';

export type SortBy = 'name' | 'created_at' | 'due_date' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface TaskFiltersState {
  searchTerm: string;
  priorityFilter: string | null;
  statusFilter: string | null;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface TaskFiltersActions {
  setSearchTerm: (term: string) => void;
  clearSearchTerm: () => void;
  setPriorityFilter: (priority: string | null) => void;
  setStatusFilter: (status: string | null) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  togglePriorityFilter: (priority: string | null) => void;
  toggleStatusFilter: (status: string | null) => void;
  clearPriorityFilter: () => void;
  clearStatusFilter: () => void;
  clearAllFilters: () => void;
  resetSort: () => void;
  resetAll: () => void;
  resetFilters: () => void;
}

export type TaskFiltersStore = TaskFiltersState & TaskFiltersActions;

const initialState: TaskFiltersState = {
  searchTerm: '',
  priorityFilter: null,
  statusFilter: null,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useTaskFiltersStore = create<TaskFiltersStore>((set, get) => ({
  ...initialState,

  setSearchTerm: (term) => set({ searchTerm: term }),

  clearSearchTerm: () => set({ searchTerm: '' }),

  setPriorityFilter: (priority) => set({ priorityFilter: priority }),

  setStatusFilter: (status) => set({ statusFilter: status }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSortOrder: (order) => set({ sortOrder: order }),

  toggleSortOrder: () =>
    set((state) => ({
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
    })),

  togglePriorityFilter: (priority) =>
    set((state) => ({
      priorityFilter: state.priorityFilter === priority ? null : priority,
    })),

  toggleStatusFilter: (status) =>
    set((state) => ({
      statusFilter: state.statusFilter === status ? null : status,
    })),

  clearPriorityFilter: () => set({ priorityFilter: null }),

  clearStatusFilter: () => set({ statusFilter: null }),

  clearAllFilters: () =>
    set({
      priorityFilter: null,
      statusFilter: null,
    }),

  resetSort: () =>
    set({
      sortBy: 'created_at',
      sortOrder: 'desc',
    }),

  resetAll: () => set(initialState),

  resetFilters: () => set(initialState),
}));

// Computed selectors
export const useTaskFiltersSelectors = () => {
  const state = useTaskFiltersStore();

  return {
    ...state,
    hasActiveFilters: Boolean(state.priorityFilter || state.statusFilter),
    hasActiveSort: state.sortBy !== 'created_at' || state.sortOrder !== 'desc',
  };
};
