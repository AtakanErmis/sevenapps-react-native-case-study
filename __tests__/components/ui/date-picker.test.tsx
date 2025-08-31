import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { DatePicker } from '@/components/ui/date-picker';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ value, onChange, testID }: any) => (
      <View testID={testID || 'date-time-picker'}>
        <View testID="mock-date-select" onTouchEnd={() => onChange(null, new Date('2024-12-31'))} />
      </View>
    ),
  };
});

// Mock Feather icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

// Mock date formatter utility
jest.mock('@/lib/utils/date', () => ({
  formatDate: (date: string) => {
    // Convert ISO date string to MM/DD/YYYY format for testing
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US');
  },
}));

describe('DatePicker', () => {
  const mockOnDateChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('renders with label and placeholder', () => {
      const { getByText } = render(
        <DatePicker label="Due Date" onDateChange={mockOnDateChange} testID="date-picker" />
      );

      expect(getByText('Due Date')).toBeTruthy();
      expect(getByText('Select date')).toBeTruthy();
    });

    it('renders with custom placeholder', () => {
      const { getByText } = render(
        <DatePicker
          label="Due Date"
          onDateChange={mockOnDateChange}
          placeholder="Choose a date"
          testID="date-picker"
        />
      );

      expect(getByText('Choose a date')).toBeTruthy();
    });

    it('shows required indicator when required prop is true', () => {
      const { getByText } = render(
        <DatePicker
          label="Due Date"
          onDateChange={mockOnDateChange}
          required
          testID="date-picker"
        />
      );

      expect(getByText('Due Date*')).toBeTruthy();
    });

    it('applies testID correctly', () => {
      const { getByTestId } = render(
        <DatePicker label="Due Date" onDateChange={mockOnDateChange} testID="custom-date-picker" />
      );

      expect(getByTestId('custom-date-picker')).toBeTruthy();
      expect(getByTestId('custom-date-picker-button')).toBeTruthy();
    });
  });

  describe('Date selection', () => {
    it('opens date picker when button is pressed', () => {
      const { getByTestId, queryByTestId } = render(
        <DatePicker label="Due Date" onDateChange={mockOnDateChange} testID="date-picker" />
      );

      // Initially, date picker should not be visible
      expect(queryByTestId('date-picker-picker')).toBeNull();

      // Press the button to open date picker
      fireEvent.press(getByTestId('date-picker-button'));

      // Now date picker should be visible
      expect(getByTestId('date-picker-picker')).toBeTruthy();
    });

    it('calls onDateChange when date is selected', () => {
      const { getByTestId } = render(
        <DatePicker label="Due Date" onDateChange={mockOnDateChange} testID="date-picker" />
      );

      // Open date picker
      fireEvent.press(getByTestId('date-picker-button'));

      // Simulate date selection
      const mockDateSelect = getByTestId('mock-date-select');
      fireEvent(mockDateSelect, 'touchEnd');

      expect(mockOnDateChange).toHaveBeenCalledWith('2024-12-31');
    });

    it('does not open date picker when disabled', () => {
      const { getByTestId, queryByTestId } = render(
        <DatePicker
          label="Due Date"
          onDateChange={mockOnDateChange}
          disabled
          testID="date-picker"
        />
      );

      fireEvent.press(getByTestId('date-picker-button'));

      expect(queryByTestId('date-picker-picker')).toBeNull();
    });
  });

  describe('Date display', () => {
    it('displays formatted date when value is provided', () => {
      const { getByText } = render(
        <DatePicker
          label="Due Date"
          value="2024-12-31"
          onDateChange={mockOnDateChange}
          testID="date-picker"
        />
      );

      expect(getByText('12/31/2024')).toBeTruthy();
    });
  });

  describe('Clear functionality', () => {
    it('shows clear button when value is provided', () => {
      const { getByTestId } = render(
        <DatePicker
          label="Due Date"
          value="2024-12-31"
          onDateChange={mockOnDateChange}
          testID="date-picker"
        />
      );

      expect(getByTestId('date-picker-clear')).toBeTruthy();
    });

    it('does not show clear button when no value is provided', () => {
      const { queryByTestId } = render(
        <DatePicker label="Due Date" onDateChange={mockOnDateChange} testID="date-picker" />
      );

      expect(queryByTestId('date-picker-clear')).toBeNull();
    });

    it('does not show clear button when disabled', () => {
      const { queryByTestId } = render(
        <DatePicker
          label="Due Date"
          value="2024-12-31"
          onDateChange={mockOnDateChange}
          disabled
          testID="date-picker"
        />
      );

      expect(queryByTestId('date-picker-clear')).toBeNull();
    });

    it('calls onDateChange with undefined when clear is pressed', () => {
      const { getByTestId } = render(
        <DatePicker
          label="Due Date"
          value="2024-12-31"
          onDateChange={mockOnDateChange}
          testID="date-picker"
        />
      );

      fireEvent.press(getByTestId('date-picker-clear'));

      expect(mockOnDateChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Error handling', () => {
    it('displays error message when hasError is true', () => {
      const { getByTestId } = render(
        <DatePicker
          label="Due Date"
          onDateChange={mockOnDateChange}
          hasError
          error="Date is required"
          testID="date-picker"
        />
      );

      expect(getByTestId('date-picker-error')).toHaveTextContent('Date is required');
    });

    it('applies error styling when hasError is true', () => {
      expect(() => {
        render(
          <DatePicker
            label="Due Date"
            onDateChange={mockOnDateChange}
            hasError
            testID="date-picker"
          />
        );
      }).not.toThrow();
    });

    it('does not display error message when hasError is false', () => {
      const { queryByTestId } = render(
        <DatePicker
          label="Due Date"
          onDateChange={mockOnDateChange}
          error="Date is required"
          testID="date-picker"
        />
      );

      expect(queryByTestId('date-picker-error')).toBeNull();
    });
  });

  describe('Disabled state', () => {
    it('applies disabled styling when disabled', () => {
      expect(() => {
        render(
          <DatePicker
            label="Due Date"
            onDateChange={mockOnDateChange}
            disabled
            testID="date-picker"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Date constraints', () => {
    it('passes minimumDate and maximumDate to DateTimePicker', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');

      const { getByTestId } = render(
        <DatePicker
          label="Due Date"
          onDateChange={mockOnDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
          testID="date-picker"
        />
      );

      // Open date picker
      fireEvent.press(getByTestId('date-picker-button'));

      // Check that DateTimePicker is rendered (constraints would be passed to it)
      expect(getByTestId('date-picker-picker')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels', () => {
      const { getByText } = render(
        <DatePicker label="Due Date" onDateChange={mockOnDateChange} testID="date-picker" />
      );

      expect(getByText('Due Date')).toBeTruthy();
    });

    it('has proper button for screen readers', () => {
      const { getByTestId } = render(
        <DatePicker label="Due Date" onDateChange={mockOnDateChange} testID="date-picker" />
      );

      const button = getByTestId('date-picker-button');
      expect(button).toBeTruthy();
    });
  });
});
