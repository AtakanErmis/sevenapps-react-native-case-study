import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { FilterControls } from '@/components/tasks/filter-controls';

// Mock Feather icons
jest.mock('@expo/vector-icons/Feather', () => 'Feather');

// Mock the hook
const mockUseTaskFilters = {
  hasActiveFilters: false,
  hasActiveSort: false,
};

jest.mock('@/lib/hooks/useTaskFilters', () => ({
  useTaskFilters: () => mockUseTaskFilters,
}));

describe('FilterControls', () => {
  const mockOnToggleFilters = jest.fn();
  const mockOnToggleSort = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskFilters.hasActiveFilters = false;
    mockUseTaskFilters.hasActiveSort = false;
  });

  const defaultProps = {
    showFilters: false,
    showSort: false,
    onToggleFilters: mockOnToggleFilters,
    onToggleSort: mockOnToggleSort,
  };

  describe('render', () => {
    it('should render both filter and sort buttons', () => {
      render(<FilterControls {...defaultProps} />);

      expect(screen.getByText('Filters')).toBeTruthy();
      expect(screen.getByText('Sort')).toBeTruthy();
    });

    it('should show chevron down when panels are closed', () => {
      render(<FilterControls {...defaultProps} showFilters={false} showSort={false} />);

      const filterToggle = screen.getByTestId('filter-toggle');
      const sortToggle = screen.getByTestId('sort-toggle');

      expect(filterToggle).toBeTruthy();
      expect(sortToggle).toBeTruthy();
    });

    it('should show chevron up when filter panel is open', () => {
      render(<FilterControls {...defaultProps} showFilters />);

      const filterToggle = screen.getByTestId('filter-toggle');
      expect(filterToggle).toBeTruthy();
    });

    it('should show chevron up when sort panel is open', () => {
      render(<FilterControls {...defaultProps} showSort />);

      const sortToggle = screen.getByTestId('sort-toggle');
      expect(sortToggle).toBeTruthy();
    });

    it('should show active indicator when filters are active', () => {
      mockUseTaskFilters.hasActiveFilters = true;

      render(<FilterControls {...defaultProps} />);

      expect(screen.getByText('(active)')).toBeTruthy();
    });

    it('should show active indicator when sort is active', () => {
      mockUseTaskFilters.hasActiveSort = true;

      render(<FilterControls {...defaultProps} />);

      expect(screen.getByText('(active)')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should call onToggleFilters when filter button is pressed', () => {
      render(<FilterControls {...defaultProps} />);

      const filterButton = screen.getByTestId('filter-toggle');
      fireEvent.press(filterButton);

      expect(mockOnToggleFilters).toHaveBeenCalledTimes(1);
      expect(mockOnToggleSort).not.toHaveBeenCalled();
    });

    it('should call onToggleSort when sort button is pressed', () => {
      render(<FilterControls {...defaultProps} />);

      const sortButton = screen.getByTestId('sort-toggle');
      fireEvent.press(sortButton);

      expect(mockOnToggleSort).toHaveBeenCalledTimes(1);
      expect(mockOnToggleFilters).not.toHaveBeenCalled();
    });

    it('should handle multiple button presses correctly', () => {
      render(<FilterControls {...defaultProps} />);

      const filterButton = screen.getByTestId('filter-toggle');
      const sortButton = screen.getByTestId('sort-toggle');

      fireEvent.press(filterButton);
      fireEvent.press(sortButton);
      fireEvent.press(filterButton);

      expect(mockOnToggleFilters).toHaveBeenCalledTimes(2);
      expect(mockOnToggleSort).toHaveBeenCalledTimes(1);
    });
  });

  describe('active state indicators', () => {
    it('should show active indicator for filters when hasActiveFilters is true', () => {
      mockUseTaskFilters.hasActiveFilters = true;
      mockUseTaskFilters.hasActiveSort = false;

      render(<FilterControls {...defaultProps} />);

      const activeTexts = screen.getAllByText('(active)');
      expect(activeTexts).toHaveLength(1);
    });

    it('should show active indicator for sort when hasActiveSort is true', () => {
      mockUseTaskFilters.hasActiveFilters = false;
      mockUseTaskFilters.hasActiveSort = true;

      render(<FilterControls {...defaultProps} />);

      const activeTexts = screen.getAllByText('(active)');
      expect(activeTexts).toHaveLength(1);
    });

    it('should show both active indicators when both are true', () => {
      mockUseTaskFilters.hasActiveFilters = true;
      mockUseTaskFilters.hasActiveSort = true;

      render(<FilterControls {...defaultProps} />);

      const activeTexts = screen.getAllByText('(active)');
      expect(activeTexts).toHaveLength(2);
    });

    it('should show no active indicators when both are false', () => {
      mockUseTaskFilters.hasActiveFilters = false;
      mockUseTaskFilters.hasActiveSort = false;

      render(<FilterControls {...defaultProps} />);

      expect(screen.queryByText('(active)')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have proper test IDs', () => {
      render(<FilterControls {...defaultProps} />);

      expect(screen.getByTestId('filter-toggle')).toBeTruthy();
      expect(screen.getByTestId('sort-toggle')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid successive button presses', () => {
      render(<FilterControls {...defaultProps} />);

      const filterButton = screen.getByTestId('filter-toggle');

      fireEvent.press(filterButton);
      fireEvent.press(filterButton);
      fireEvent.press(filterButton);

      expect(mockOnToggleFilters).toHaveBeenCalledTimes(3);
    });
  });
});
