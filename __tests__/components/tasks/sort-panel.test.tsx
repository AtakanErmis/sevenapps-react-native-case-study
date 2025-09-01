import { render, screen, fireEvent } from '@testing-library/react-native';

import { SortPanel } from '@/components/tasks/sort-panel';

// Mock the sort selector component
jest.mock('@/components/ui/sort-selector', () => ({
  SortSelector: ({
    sortOptions,
    selectedSort,
    sortOrder,
    onSortChange,
    onOrderToggle,
    testID,
  }: any) => {
    const { View, TouchableOpacity, Text } = require('react-native');
    const MockedSortSelector = () => {
      return (
        <View testID={testID}>
          {sortOptions.map((option: any) => {
            const isSelected = selectedSort === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                testID={`${testID}-${option.id}`}
                onPress={() => onSortChange(option.value)}
                {...(isSelected ? { 'data-selected': true } : {})}>
                <Text>{option.label}</Text>
                {isSelected && (
                  <TouchableOpacity testID={`${testID}-order-toggle`} onPress={onOrderToggle}>
                    <Text>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    };
    MockedSortSelector.displayName = 'SortSelector';
    return <MockedSortSelector />;
  },
}));

// Mock the Zustand store
const mockUseTaskFilters = {
  sortBy: 'created_at' as string,
  sortOrder: 'desc' as 'asc' | 'desc',
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
      render(<SortPanel showSort />);

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
      render(<SortPanel showSort />);
    });

    it('should call setSortBy when sort option is selected', () => {
      const nameOption = screen.getByTestId('sort-selector-name');
      fireEvent.press(nameOption);

      expect(mockUseTaskFilters.setSortBy).toHaveBeenCalledWith('name');
    });

    it('should call toggleSortOrder when order toggle is pressed', () => {
      render(<SortPanel showSort />);

      const orderToggle = screen.getByTestId('sort-selector-order-toggle');
      fireEvent.press(orderToggle);

      expect(mockUseTaskFilters.toggleSortOrder).toHaveBeenCalled();
    });

    it('should handle different sort options', () => {
      render(<SortPanel showSort />);

      const dueDateOption = screen.getByTestId('sort-selector-due-date');
      fireEvent.press(dueDateOption);

      expect(mockUseTaskFilters.setSortBy).toHaveBeenCalledWith('due_date');
    });
  });

  describe('reset functionality', () => {
    it('should show reset button when hasActiveSort is true', () => {
      mockUseTaskFilters.hasActiveSort = true;

      render(<SortPanel showSort />);

      expect(screen.getByTestId('reset-sort')).toBeTruthy();
    });

    it('should not show reset button when hasActiveSort is false', () => {
      mockUseTaskFilters.hasActiveSort = false;

      render(<SortPanel showSort />);

      expect(screen.queryByTestId('reset-sort')).toBeNull();
    });

    it('should call resetSort when reset button is pressed', () => {
      mockUseTaskFilters.hasActiveSort = true;

      render(<SortPanel showSort />);

      const resetButton = screen.getByTestId('reset-sort');
      fireEvent.press(resetButton);

      expect(mockUseTaskFilters.resetSort).toHaveBeenCalled();
    });
  });

  describe('state reflection', () => {
    it('should pass current sortBy to SortSelector', () => {
      mockUseTaskFilters.sortBy = 'name';

      render(<SortPanel showSort />);

      // When name is selected, the order toggle should be visible within that option
      expect(screen.getByTestId('sort-selector-order-toggle')).toBeTruthy();
    });

    it('should pass current sortOrder to SortSelector', () => {
      mockUseTaskFilters.sortBy = 'name';
      mockUseTaskFilters.sortOrder = 'asc';

      render(<SortPanel showSort />);

      const orderToggle = screen.getByTestId('sort-selector-order-toggle');
      expect(orderToggle.props.children[0].props.children).toBe('Ascending');
    });

    it('should display descending order correctly', () => {
      mockUseTaskFilters.sortBy = 'name';
      mockUseTaskFilters.sortOrder = 'desc';

      render(<SortPanel showSort />);

      const orderToggle = screen.getByTestId('sort-selector-order-toggle');
      expect(orderToggle.props.children[0].props.children).toBe('Descending');
    });
  });
});
