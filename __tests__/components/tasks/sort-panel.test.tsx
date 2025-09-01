import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SortPanel } from '@/components/tasks/sort-panel';

// Mock the sort selector component
jest.mock('@/components/ui/sort-selector', () => ({
  SortSelector: ({ sortOptions, selectedSort, sortOrder, onSortChange, onOrderToggle, testID }: any) => {
    const MockedSortSelector = () => {
      return (
        <view testID={testID}>
          {sortOptions.map((option: any) => (
            <button 
              key={option.value} 
              testID={`sort-option-${option.value}`}
              onPress={() => onSortChange(option.value)}
              data-selected={selectedSort === option.value}
            >
              {option.label}
            </button>
          ))}
          <button 
            testID="order-toggle"
            onPress={onOrderToggle}
          >
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </view>
      );
    };
    MockedSortSelector.displayName = 'SortSelector';
    return <MockedSortSelector />;
  },
}));

// Mock the Zustand store
const mockUseTaskFilters = {
  sortBy: 'created_at',
  sortOrder: 'desc',
  hasActiveSort: false,
  setSortBy: jest.fn(),
  toggleSortOrder: jest.fn(),
  resetSort: jest.fn(),
};

jest.mock('@/lib/hooks/useTaskFilters', () => ({
  useTaskFilters: () => mockUseTaskFilters,
}));

describe('SortPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskFilters.sortBy = 'created_at';
    mockUseTaskFilters.sortOrder = 'desc';
    mockUseTaskFilters.hasActiveSort = false;
  });

  describe('visibility', () => {
    it('should render when showSort is true', () => {
      render(<SortPanel showSort={true} />);
      
      expect(screen.getByText('Sort by:')).toBeTruthy();
      expect(screen.getByTestId('sort-selector')).toBeTruthy();
    });

    it('should not render when showSort is false', () => {
      render(<SortPanel showSort={false} />);
      
      expect(screen.queryByText('Sort by:')).toBeNull();
      expect(screen.queryByTestId('sort-selector')).toBeNull();
    });
  });

  describe('sort interactions', () => {
    beforeEach(() => {
      render(<SortPanel showSort={true} />);
    });

    it('should call setSortBy when sort option is selected', () => {
      const nameOption = screen.getByTestId('sort-option-name');
      fireEvent.press(nameOption);
      
      expect(mockUseTaskFilters.setSortBy).toHaveBeenCalledWith('name');
    });

    it('should call toggleSortOrder when order toggle is pressed', () => {
      const orderToggle = screen.getByTestId('order-toggle');
      fireEvent.press(orderToggle);
      
      expect(mockUseTaskFilters.toggleSortOrder).toHaveBeenCalled();
    });

    it('should handle different sort options', () => {
      const dueDateOption = screen.getByTestId('sort-option-due_date');
      fireEvent.press(dueDateOption);
      
      expect(mockUseTaskFilters.setSortBy).toHaveBeenCalledWith('due_date');
    });
  });

  describe('reset functionality', () => {
    it('should show reset button when hasActiveSort is true', () => {
      mockUseTaskFilters.hasActiveSort = true;
      
      render(<SortPanel showSort={true} />);
      
      expect(screen.getByTestId('reset-sort')).toBeTruthy();
    });

    it('should not show reset button when hasActiveSort is false', () => {
      mockUseTaskFilters.hasActiveSort = false;
      
      render(<SortPanel showSort={true} />);
      
      expect(screen.queryByTestId('reset-sort')).toBeNull();
    });

    it('should call resetSort when reset button is pressed', () => {
      mockUseTaskFilters.hasActiveSort = true;
      
      render(<SortPanel showSort={true} />);
      
      const resetButton = screen.getByTestId('reset-sort');
      fireEvent.press(resetButton);
      
      expect(mockUseTaskFilters.resetSort).toHaveBeenCalled();
    });
  });

  describe('state reflection', () => {
    it('should pass current sortBy to SortSelector', () => {
      mockUseTaskFilters.sortBy = 'name';
      
      render(<SortPanel showSort={true} />);
      
      const nameOption = screen.getByTestId('sort-option-name');
      expect(nameOption.props['data-selected']).toBe(true);
    });

    it('should pass current sortOrder to SortSelector', () => {
      mockUseTaskFilters.sortOrder = 'asc';
      
      render(<SortPanel showSort={true} />);
      
      const orderToggle = screen.getByTestId('order-toggle');
      expect(orderToggle.props.children).toBe('Ascending');
    });

    it('should display descending order correctly', () => {
      mockUseTaskFilters.sortOrder = 'desc';
      
      render(<SortPanel showSort={true} />);
      
      const orderToggle = screen.getByTestId('order-toggle');
      expect(orderToggle.props.children).toBe('Descending');
    });
  });
});