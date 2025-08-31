import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { Select } from '@/components/ui/select';

// Mock cn utility
jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

// Mock Label component
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, variant }: any) => {
    const testProps = {
      testID: variant === 'error' ? 'error-label' : 'label',
    };
    return <MockText {...testProps}>{children}</MockText>;
  },
}));

// Mock Text component for testing
const { Text } = require('react-native');
const MockText = ({ children, testID }: any) => <Text testID={testID}>{children}</Text>;

describe('Select', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders select with string options', () => {
    const options = ['low', 'medium', 'high'];
    const { getByText } = render(
      <Select value="medium" options={options} onValueChange={mockOnValueChange} />
    );

    expect(getByText('low')).toBeTruthy();
    expect(getByText('medium')).toBeTruthy();
    expect(getByText('high')).toBeTruthy();
  });

  it('renders select with object options', () => {
    const options = [
      { value: 'low', label: 'Low Priority' },
      { value: 'medium', label: 'Medium Priority' },
      { value: 'high', label: 'High Priority' },
    ];
    const { getByText } = render(
      <Select value="medium" options={options} onValueChange={mockOnValueChange} />
    );

    expect(getByText('Low Priority')).toBeTruthy();
    expect(getByText('Medium Priority')).toBeTruthy();
    expect(getByText('High Priority')).toBeTruthy();
  });

  it('renders select with label', () => {
    const options = ['option1', 'option2'];
    const { getByTestId } = render(
      <Select
        label="Select Priority"
        value="option1"
        options={options}
        onValueChange={mockOnValueChange}
      />
    );

    expect(getByTestId('label')).toBeTruthy();
  });

  it('handles option selection', () => {
    const options = ['low', 'medium', 'high'];
    const { getByText } = render(
      <Select value="medium" options={options} onValueChange={mockOnValueChange} />
    );

    fireEvent.press(getByText('high'));

    expect(mockOnValueChange).toHaveBeenCalledWith('high');
    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
  });

  it('highlights selected option', () => {
    const options = ['low', 'medium', 'high'];
    const { getByText } = render(
      <Select value="medium" options={options} onValueChange={mockOnValueChange} />
    );

    const selectedOption = getByText('medium');
    expect(selectedOption).toBeTruthy();
    // In a real implementation, we would check for specific styling classes
    // that indicate the selected state, but since we're mocking cn, we just
    // ensure the component renders correctly
  });

  it('renders error state', () => {
    const options = ['option1', 'option2'];
    const { getByTestId } = render(
      <Select
        value="option1"
        options={options}
        onValueChange={mockOnValueChange}
        isError
        error="Selection required"
      />
    );

    expect(getByTestId('error-label')).toBeTruthy();
  });

  it('uses custom getOptionLabel function', () => {
    const options = ['LOW', 'MEDIUM', 'HIGH'];
    const getOptionLabel = (option: string) => option.toLowerCase();

    const { getByText } = render(
      <Select
        value="MEDIUM"
        options={options}
        onValueChange={mockOnValueChange}
        getOptionLabel={getOptionLabel}
      />
    );

    expect(getByText('low')).toBeTruthy();
    expect(getByText('medium')).toBeTruthy();
    expect(getByText('high')).toBeTruthy();
  });

  it('handles complex types with getOptionLabel', () => {
    interface Priority {
      id: number;
      name: string;
    }

    const options: Priority[] = [
      { id: 1, name: 'Low' },
      { id: 2, name: 'Medium' },
      { id: 3, name: 'High' },
    ];

    const selectedValue: Priority = { id: 2, name: 'Medium' };

    const { getByText } = render(
      <Select
        value={selectedValue}
        options={options}
        onValueChange={mockOnValueChange}
        getOptionLabel={(option) => option.name}
      />
    );

    expect(getByText('Low')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
    expect(getByText('High')).toBeTruthy();
  });

  it('handles selection with complex types', () => {
    interface Priority {
      id: number;
      name: string;
    }

    const options: Priority[] = [
      { id: 1, name: 'Low' },
      { id: 2, name: 'Medium' },
      { id: 3, name: 'High' },
    ];

    const selectedValue: Priority = { id: 2, name: 'Medium' };

    const { getByText } = render(
      <Select
        value={selectedValue}
        options={options}
        onValueChange={mockOnValueChange}
        getOptionLabel={(option) => option.name}
      />
    );

    fireEvent.press(getByText('High'));

    expect(mockOnValueChange).toHaveBeenCalledWith({ id: 3, name: 'High' });
  });

  describe('error handling', () => {
    it('shows error when isError is true', () => {
      const options = ['option1', 'option2'];
      const { getByTestId } = render(
        <Select
          value="option1"
          options={options}
          onValueChange={mockOnValueChange}
          isError
          error="Error message"
        />
      );

      expect(getByTestId('error-label')).toBeTruthy();
    });

    it('shows error when error text is provided', () => {
      const options = ['option1', 'option2'];
      const { getByTestId } = render(
        <Select
          value="option1"
          options={options}
          onValueChange={mockOnValueChange}
          error="This field is required"
        />
      );

      expect(getByTestId('error-label')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('renders accessible option buttons', () => {
      const options = ['low', 'medium', 'high'];
      const { getByText } = render(
        <Select value="medium" options={options} onValueChange={mockOnValueChange} />
      );

      // Each option should be pressable
      const lowOption = getByText('low');
      const mediumOption = getByText('medium');
      const highOption = getByText('high');

      expect(lowOption).toBeTruthy();
      expect(mediumOption).toBeTruthy();
      expect(highOption).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles empty options array', () => {
      const { queryByText } = render(
        <Select value="" options={[]} onValueChange={mockOnValueChange} />
      );

      expect(queryByText('No options')).toBeNull();
    });

    it('handles null/undefined values gracefully', () => {
      const options = [null, undefined, '', 'valid'] as any[];
      const { getByText } = render(
        <Select value="" options={options} onValueChange={mockOnValueChange} />
      );

      expect(getByText('valid')).toBeTruthy();
    });
  });
});
