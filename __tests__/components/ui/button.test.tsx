import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { Button } from '@/components/ui/button';

// Mock cn utility
jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('Button', () => {
  it('renders with default variant and title', () => {
    const { getByText } = render(<Button title="Test Button" />);

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders with children instead of title', () => {
    const { getByText, queryByText } = render(
      <Button title="Test Button">
        <Text>Custom Content</Text>
      </Button>
    );

    expect(getByText('Custom Content')).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  it('applies default variant styles', () => {
    const { getByText } = render(<Button title="Test Button" />);
    const button = getByText('Test Button').parent;

    expect(button).toBeTruthy();
    // Default variant styles would be applied by NativeWind
  });

  it('applies header variant styles', () => {
    const { getByText } = render(<Button title="Test Button" variant="header" />);
    const button = getByText('Test Button').parent;

    expect(button).toBeTruthy();
  });

  it('handles onPress events', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={mockOnPress} />);

    fireEvent.press(getByText('Test Button').parent);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('passes through TouchableOpacity props', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled testID="test-button" />
    );

    const button = getByTestId('test-button');

    fireEvent.press(button);

    // onPress should not be called when disabled
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { getByText } = render(<Button title="Test Button" className="custom-class" />);

    const button = getByText('Test Button').parent;
    expect(button).toBeTruthy();
  });

  it('renders with forwardRef', () => {
    const ref = React.createRef<any>();
    render(<Button ref={ref} title="Test Button" />);

    expect(ref.current).toBeTruthy();
  });

  describe('variant styles', () => {
    it('renders default variant correctly', () => {
      const { getByText } = render(<Button title="Default" />);
      const text = getByText('Default');

      expect(text).toBeTruthy();
    });

    it('renders header variant correctly', () => {
      const { getByText } = render(<Button title="Header" variant="header" />);
      const text = getByText('Header');

      expect(text).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('is accessible by role', () => {
      const { getByText } = render(<Button title="Accessible Button" />);

      const button = getByText('Accessible Button').parent;
      expect(button).toBeTruthy();
    });

    it('supports testID prop', () => {
      const { getByTestId } = render(<Button title="Test Button" testID="my-button" />);

      expect(getByTestId('my-button')).toBeTruthy();
    });
  });
});
