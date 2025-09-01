import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FiltersPanel } from '@/components/tasks/filters-panel';

// Mock the filter components
jest.mock('@/components/ui/filter-chips', () => ({
  FilterChips: ({ chips, selectedValue, onSelect, testID }: any) => {
    const MockedFilterChips = () => {
      return (
        <view testID={testID}>
          {chips.map((chip: any) => (
            <button 
              key={chip.value} 
              testID={`chip-${chip.value}`}
              onPress={() => onSelect(chip.value)}
              data-selected={selectedValue === chip.value}
            >
              {chip.label}
            </button>
          ))}
        </view>
      );
    };
    MockedFilterChips.displayName = 'FilterChips';
    return <MockedFilterChips />;
  },
}));

// Mock the Zustand store
const mockUseTaskFilters = {
  priorityFilter: null,
  statusFilter: null,
  hasActiveFilters: false,
  setPriorityFilter: jest.fn(),
  setStatusFilter: jest.fn(),
  clearPriorityFilter: jest.fn(),
  clearStatusFilter: jest.fn(),
  clearAllFilters: jest.fn(),
};

jest.mock('@/lib/hooks/useTaskFilters', () => ({
  useTaskFilters: () => mockUseTaskFilters,
}));

describe('FiltersPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskFilters.priorityFilter = null;
    mockUseTaskFilters.statusFilter = null;
    mockUseTaskFilters.hasActiveFilters = false;
  });

  describe('visibility', () => {
    it('should render when showFilters is true', () => {
      render(<FiltersPanel showFilters={true} />);
      
      expect(screen.getByText('Priority:')).toBeTruthy();
      expect(screen.getByText('Status:')).toBeTruthy();
    });

    it('should not render when showFilters is false', () => {
      render(<FiltersPanel showFilters={false} />);
      
      expect(screen.queryByText('Priority:')).toBeNull();
      expect(screen.queryByText('Status:')).toBeNull();
    });
  });

  describe('filter interactions', () => {
    beforeEach(() => {
      render(<FiltersPanel showFilters={true} />);
    });

    it('should call setPriorityFilter when priority chip is selected', () => {
      const highChip = screen.getByTestId('chip-high');
      fireEvent.press(highChip);
      
      expect(mockUseTaskFilters.setPriorityFilter).toHaveBeenCalledWith('high');
    });

    it('should call setStatusFilter when status chip is selected', () => {
      const completedChip = screen.getByTestId('chip-completed');
      fireEvent.press(completedChip);
      
      expect(mockUseTaskFilters.setStatusFilter).toHaveBeenCalledWith('completed');
    });
  });

  describe('clear functionality', () => {
    it('should show clear button for priority when priority filter is set', () => {
      mockUseTaskFilters.priorityFilter = 'high';
      
      render(<FiltersPanel showFilters={true} />);
      
      expect(screen.getByTestId('clear-priority-filter')).toBeTruthy();
    });

    it('should show clear button for status when status filter is set', () => {
      mockUseTaskFilters.statusFilter = 'completed';
      
      render(<FiltersPanel showFilters={true} />);
      
      expect(screen.getByTestId('clear-status-filter')).toBeTruthy();
    });

    it('should call clearPriorityFilter when clear button is pressed', () => {
      mockUseTaskFilters.priorityFilter = 'high';
      
      render(<FiltersPanel showFilters={true} />);
      
      const clearButton = screen.getByTestId('clear-priority-filter');
      fireEvent.press(clearButton);
      
      expect(mockUseTaskFilters.clearPriorityFilter).toHaveBeenCalled();
    });

    it('should call clearStatusFilter when clear button is pressed', () => {
      mockUseTaskFilters.statusFilter = 'completed';
      
      render(<FiltersPanel showFilters={true} />);
      
      const clearButton = screen.getByTestId('clear-status-filter');
      fireEvent.press(clearButton);
      
      expect(mockUseTaskFilters.clearStatusFilter).toHaveBeenCalled();
    });

    it('should show clear all button when hasActiveFilters is true', () => {
      mockUseTaskFilters.hasActiveFilters = true;
      
      render(<FiltersPanel showFilters={true} />);
      
      expect(screen.getByTestId('clear-all-filters')).toBeTruthy();
    });

    it('should call clearAllFilters when clear all button is pressed', () => {
      mockUseTaskFilters.hasActiveFilters = true;
      
      render(<FiltersPanel showFilters={true} />);
      
      const clearAllButton = screen.getByTestId('clear-all-filters');
      fireEvent.press(clearAllButton);
      
      expect(mockUseTaskFilters.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('no active filters', () => {
    it('should not show individual clear buttons when filters are null', () => {
      mockUseTaskFilters.priorityFilter = null;
      mockUseTaskFilters.statusFilter = null;
      
      render(<FiltersPanel showFilters={true} />);
      
      expect(screen.queryByTestId('clear-priority-filter')).toBeNull();
      expect(screen.queryByTestId('clear-status-filter')).toBeNull();
    });

    it('should not show clear all button when hasActiveFilters is false', () => {
      mockUseTaskFilters.hasActiveFilters = false;
      
      render(<FiltersPanel showFilters={true} />);
      
      expect(screen.queryByTestId('clear-all-filters')).toBeNull();
    });
  });
});