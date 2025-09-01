import { renderHook, act } from '@testing-library/react-native';
import { useTaskFiltersStore } from '@/store/task-filters';

describe('useTaskFiltersStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTaskFiltersStore());
    act(() => {
      result.current.resetFilters();
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      expect(result.current.searchTerm).toBe('');
      expect(result.current.priorityFilter).toBe(null);
      expect(result.current.statusFilter).toBe(null);
      expect(result.current.sortBy).toBe('created_at');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('search term management', () => {
    it('should update search term', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('test search');
      });
      
      expect(result.current.searchTerm).toBe('test search');
    });

    it('should clear search term', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('test search');
      });
      
      act(() => {
        result.current.clearSearchTerm();
      });
      
      expect(result.current.searchTerm).toBe('');
    });

    it('should handle empty string search term', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('');
      });
      
      expect(result.current.searchTerm).toBe('');
    });

    it('should handle whitespace search term', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('   ');
      });
      
      expect(result.current.searchTerm).toBe('   ');
    });
  });

  describe('priority filter management', () => {
    it('should set priority filter to high', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setPriorityFilter('high');
      });
      
      expect(result.current.priorityFilter).toBe('high');
    });

    it('should set priority filter to medium', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setPriorityFilter('medium');
      });
      
      expect(result.current.priorityFilter).toBe('medium');
    });

    it('should set priority filter to low', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setPriorityFilter('low');
      });
      
      expect(result.current.priorityFilter).toBe('low');
    });

    it('should clear priority filter', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setPriorityFilter('high');
      });
      
      act(() => {
        result.current.clearPriorityFilter();
      });
      
      expect(result.current.priorityFilter).toBe(null);
    });

    it('should toggle priority filter on when null', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.togglePriorityFilter('medium');
      });
      
      expect(result.current.priorityFilter).toBe('medium');
    });

    it('should toggle priority filter off when same value', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setPriorityFilter('medium');
      });
      
      act(() => {
        result.current.togglePriorityFilter('medium');
      });
      
      expect(result.current.priorityFilter).toBe(null);
    });

    it('should change priority filter when different value', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setPriorityFilter('high');
      });
      
      act(() => {
        result.current.togglePriorityFilter('low');
      });
      
      expect(result.current.priorityFilter).toBe('low');
    });
  });

  describe('status filter management', () => {
    it('should set status filter to completed', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setStatusFilter('completed');
      });
      
      expect(result.current.statusFilter).toBe('completed');
    });

    it('should set status filter to incomplete', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setStatusFilter('incomplete');
      });
      
      expect(result.current.statusFilter).toBe('incomplete');
    });

    it('should set status filter to pending', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setStatusFilter('pending');
      });
      
      expect(result.current.statusFilter).toBe('pending');
    });

    it('should set status filter to in_progress', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setStatusFilter('in_progress');
      });
      
      expect(result.current.statusFilter).toBe('in_progress');
    });

    it('should clear status filter', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setStatusFilter('completed');
      });
      
      act(() => {
        result.current.clearStatusFilter();
      });
      
      expect(result.current.statusFilter).toBe(null);
    });

    it('should toggle status filter on when null', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.toggleStatusFilter('pending');
      });
      
      expect(result.current.statusFilter).toBe('pending');
    });

    it('should toggle status filter off when same value', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setStatusFilter('completed');
      });
      
      act(() => {
        result.current.toggleStatusFilter('completed');
      });
      
      expect(result.current.statusFilter).toBe(null);
    });

    it('should change status filter when different value', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setStatusFilter('pending');
      });
      
      act(() => {
        result.current.toggleStatusFilter('in_progress');
      });
      
      expect(result.current.statusFilter).toBe('in_progress');
    });
  });

  describe('sorting management', () => {
    it('should set sort by name', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortBy('name');
      });
      
      expect(result.current.sortBy).toBe('name');
    });

    it('should set sort by created_at', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortBy('created_at');
      });
      
      expect(result.current.sortBy).toBe('created_at');
    });

    it('should set sort by due_date', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortBy('due_date');
      });
      
      expect(result.current.sortBy).toBe('due_date');
    });

    it('should set sort by priority', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortBy('priority');
      });
      
      expect(result.current.sortBy).toBe('priority');
    });

    it('should set sort order to asc', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortOrder('asc');
      });
      
      expect(result.current.sortOrder).toBe('asc');
    });

    it('should set sort order to desc', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortOrder('desc');
      });
      
      expect(result.current.sortOrder).toBe('desc');
    });

    it('should toggle sort order from asc to desc', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortOrder('asc');
      });
      
      act(() => {
        result.current.toggleSortOrder();
      });
      
      expect(result.current.sortOrder).toBe('desc');
    });

    it('should toggle sort order from desc to asc', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortOrder('desc');
      });
      
      act(() => {
        result.current.toggleSortOrder();
      });
      
      expect(result.current.sortOrder).toBe('asc');
    });
  });

  describe('reset functionality', () => {
    it('should reset all filters to initial state', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('test');
        result.current.setPriorityFilter('high');
        result.current.setStatusFilter('completed');
        result.current.setSortBy('name');
        result.current.setSortOrder('asc');
      });
      
      act(() => {
        result.current.resetFilters();
      });
      
      expect(result.current.searchTerm).toBe('');
      expect(result.current.priorityFilter).toBe(null);
      expect(result.current.statusFilter).toBe(null);
      expect(result.current.sortBy).toBe('created_at');
      expect(result.current.sortOrder).toBe('desc');
    });

    it('should reset from partial state', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('partial test');
        result.current.setPriorityFilter('medium');
      });
      
      act(() => {
        result.current.resetFilters();
      });
      
      expect(result.current.searchTerm).toBe('');
      expect(result.current.priorityFilter).toBe(null);
      expect(result.current.statusFilter).toBe(null);
      expect(result.current.sortBy).toBe('created_at');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('combined operations', () => {
    it('should handle multiple filter changes in sequence', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('groceries');
      });
      
      act(() => {
        result.current.setPriorityFilter('high');
      });
      
      act(() => {
        result.current.setStatusFilter('pending');
      });
      
      act(() => {
        result.current.setSortBy('due_date');
      });
      
      act(() => {
        result.current.setSortOrder('asc');
      });
      
      expect(result.current.searchTerm).toBe('groceries');
      expect(result.current.priorityFilter).toBe('high');
      expect(result.current.statusFilter).toBe('pending');
      expect(result.current.sortBy).toBe('due_date');
      expect(result.current.sortOrder).toBe('asc');
    });

    it('should handle clearing individual filters while maintaining others', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSearchTerm('test');
        result.current.setPriorityFilter('high');
        result.current.setStatusFilter('completed');
      });
      
      act(() => {
        result.current.clearPriorityFilter();
      });
      
      expect(result.current.searchTerm).toBe('test');
      expect(result.current.priorityFilter).toBe(null);
      expect(result.current.statusFilter).toBe('completed');
    });

    it('should maintain state persistence across multiple hook calls', () => {
      const { result: result1 } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result1.current.setSearchTerm('persistent test');
        result1.current.setPriorityFilter('medium');
      });
      
      const { result: result2 } = renderHook(() => useTaskFiltersStore());
      
      expect(result2.current.searchTerm).toBe('persistent test');
      expect(result2.current.priorityFilter).toBe('medium');
    });
  });

  describe('edge cases', () => {
    it('should handle null priority filter toggle', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.togglePriorityFilter(null as any);
      });
      
      expect(result.current.priorityFilter).toBe(null);
    });

    it('should handle null status filter toggle', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.toggleStatusFilter(null as any);
      });
      
      expect(result.current.statusFilter).toBe(null);
    });

    it('should handle invalid sort by values gracefully', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortBy('invalid' as any);
      });
      
      expect(result.current.sortBy).toBe('invalid');
    });

    it('should handle invalid sort order values gracefully', () => {
      const { result } = renderHook(() => useTaskFiltersStore());
      
      act(() => {
        result.current.setSortOrder('invalid' as any);
      });
      
      expect(result.current.sortOrder).toBe('invalid');
    });
  });
});