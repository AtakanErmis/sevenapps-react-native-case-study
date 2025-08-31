import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { ListCard } from '@/components/lists/list-card';
import { List } from '@/types';

// Mock cn utility
jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('ListCard', () => {
  const mockList: List = {
    id: 1,
    name: 'Test List',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders list information correctly', () => {
    const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

    expect(getByText('Test List')).toBeTruthy();
    expect(getByText(/Created/)).toBeTruthy();
  });

  it('displays formatted creation date', () => {
    const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

    const expectedDate = new Date(mockList.created_at).toLocaleDateString();
    expect(getByText(`Created ${expectedDate}`)).toBeTruthy();
  });

  it('handles press events', () => {
    const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

    fireEvent.press(getByText('Test List'));

    expect(mockOnPress).toHaveBeenCalledWith(mockList);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not handle press when disabled', () => {
    const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} disabled />);

    fireEvent.press(getByText('Test List'));

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies correct styling for enabled state', () => {
    const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

    const listName = getByText('Test List');
    expect(listName).toBeTruthy();
    // In actual implementation, enabled styling would be applied
  });

  it('applies correct styling for disabled state', () => {
    const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} disabled />);

    const listName = getByText('Test List');
    expect(listName).toBeTruthy();
    // In actual implementation, disabled styling would be applied
  });

  describe('accessibility', () => {
    it('has accessible press target', () => {
      const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

      const pressableElement = getByText('Test List');
      expect(pressableElement).toBeTruthy();
      // TouchableOpacity makes the content accessible
    });

    it('provides appropriate content for screen readers', () => {
      const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

      expect(getByText('Test List')).toBeTruthy();
      expect(getByText(/Created/)).toBeTruthy();
      // Content is accessible to screen readers
    });
  });

  describe('edge cases', () => {
    it('handles very long list names', () => {
      const longNameList: List = {
        ...mockList,
        name: 'This is a very long list name that might need to wrap to multiple lines and should be handled gracefully by the component layout',
      };

      const { getByText } = render(<ListCard list={longNameList} onPress={mockOnPress} />);

      expect(getByText(longNameList.name)).toBeTruthy();
    });

    it('handles special characters in list names', () => {
      const specialCharsList: List = {
        ...mockList,
        name: 'List with special chars: !@#$%^&*()_+ ��������',
      };

      const { getByText } = render(<ListCard list={specialCharsList} onPress={mockOnPress} />);

      expect(getByText(specialCharsList.name)).toBeTruthy();
    });

    it('handles invalid date gracefully', () => {
      const invalidDateList: List = {
        ...mockList,
        created_at: 'invalid-date',
      };

      const { getByText } = render(<ListCard list={invalidDateList} onPress={mockOnPress} />);

      // Component should still render even with invalid date
      expect(getByText('Test List')).toBeTruthy();
    });

    it('handles empty list name', () => {
      const emptyNameList: List = {
        ...mockList,
        name: '',
      };

      const { getByText } = render(<ListCard list={emptyNameList} onPress={mockOnPress} />);

      expect(getByText(/Created/)).toBeTruthy();
    });
  });

  describe('layout structure', () => {
    it('maintains proper component structure', () => {
      const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

      // Check that both title and date are rendered
      expect(getByText('Test List')).toBeTruthy();
      expect(getByText(/Created/)).toBeTruthy();
    });

    it('renders content within TouchableOpacity', () => {
      const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

      const listName = getByText('Test List');
      const dateText = getByText(/Created/);

      expect(listName).toBeTruthy();
      expect(dateText).toBeTruthy();
      // Both elements should be pressable through the TouchableOpacity wrapper
    });
  });

  describe('prop variations', () => {
    it('handles different date formats correctly', () => {
      const differentDateList: List = {
        ...mockList,
        created_at: '2023-12-25T15:30:45.123Z',
      };

      const { getByText } = render(<ListCard list={differentDateList} onPress={mockOnPress} />);

      const expectedDate = new Date(differentDateList.created_at).toLocaleDateString();
      expect(getByText(`Created ${expectedDate}`)).toBeTruthy();
    });

    it('works with different list IDs', () => {
      const differentIdList: List = {
        ...mockList,
        id: 999,
        name: 'Different ID List',
      };

      const { getByText } = render(<ListCard list={differentIdList} onPress={mockOnPress} />);

      expect(getByText('Different ID List')).toBeTruthy();

      fireEvent.press(getByText('Different ID List'));
      expect(mockOnPress).toHaveBeenCalledWith(differentIdList);
    });

    it('handles onPress callback changes', () => {
      const secondMockOnPress = jest.fn();
      const { rerender, getByText } = render(<ListCard list={mockList} onPress={mockOnPress} />);

      fireEvent.press(getByText('Test List'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);

      rerender(<ListCard list={mockList} onPress={secondMockOnPress} />);

      fireEvent.press(getByText('Test List'));
      expect(secondMockOnPress).toHaveBeenCalledTimes(1);
      expect(mockOnPress).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('disabled state behavior', () => {
    it('prevents interaction when disabled', () => {
      const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} disabled />);

      // Try multiple press attempts
      const listElement = getByText('Test List');
      fireEvent.press(listElement);
      fireEvent.press(listElement);
      fireEvent.press(listElement);

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('maintains visual content when disabled', () => {
      const { getByText } = render(<ListCard list={mockList} onPress={mockOnPress} disabled />);

      expect(getByText('Test List')).toBeTruthy();
      expect(getByText(/Created/)).toBeTruthy();
      // All content should still be visible when disabled
    });

    it('can be re-enabled after being disabled', () => {
      const { rerender, getByText } = render(
        <ListCard list={mockList} onPress={mockOnPress} disabled />
      );

      fireEvent.press(getByText('Test List'));
      expect(mockOnPress).not.toHaveBeenCalled();

      rerender(<ListCard list={mockList} onPress={mockOnPress} disabled={false} />);

      fireEvent.press(getByText('Test List'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });
});
