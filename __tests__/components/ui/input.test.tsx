import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { Input } from '@/components/ui/input';

jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/label', () => {
  const { Text } = require('react-native');
  return {
    Label: ({ children, required, variant }: any) => {
      const testProps = {
        testID: variant === 'error' ? 'error-label' : 'label',
        ...(required && { accessibilityLabel: `${children} required` }),
      };
      return <Text {...testProps}>{children}</Text>;
    },
  };
});

describe('Input', () => {
  it('renders basic input without label', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text" />);

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders input with label', () => {
    const { getByText, getByPlaceholderText } = render(
      <Input label="Username" placeholder="Enter username" />
    );

    expect(getByText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Enter username')).toBeTruthy();
  });

  it('renders input with required label', () => {
    const { getByText, getByLabelText } = render(
      <Input label="Password" placeholder="Enter password" required />
    );

    expect(getByText('Password')).toBeTruthy();
    expect(getByLabelText('Password required')).toBeTruthy();
  });

  it('renders error state correctly', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <Input label="Email" placeholder="Enter email" hasError error="Email is required" />
    );

    expect(getByText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
    expect(getByTestId('error-label')).toBeTruthy();
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('handles text input changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Type here" onChangeText={mockOnChangeText} />
    );

    const input = getByPlaceholderText('Type here');
    fireEvent.changeText(input, 'Hello World');

    expect(mockOnChangeText).toHaveBeenCalledWith('Hello World');
  });

  it('renders multiline input with correct styling', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter description" multiline />);

    const input = getByPlaceholderText('Enter description');
    expect(input.props.multiline).toBe(true);
  });

  it('passes through all TextInput props', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Test input"
        maxLength={50}
        autoCapitalize="words"
        secureTextEntry
        testID="test-input"
      />
    );

    const input = getByPlaceholderText('Test input');
    expect(input.props.maxLength).toBe(50);
    expect(input.props.autoCapitalize).toBe('words');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('applies custom className', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Custom styled input" className="custom-class" />
    );

    const input = getByPlaceholderText('Custom styled input');
    expect(input).toBeTruthy();
  });

  describe('error handling', () => {
    it('shows error without hasError flag when error text is provided', () => {
      const { getByText, getByTestId } = render(
        <Input label="Field" error="This field has an error" />
      );

      expect(getByText('This field has an error')).toBeTruthy();
      expect(getByTestId('error-label')).toBeTruthy();
    });

    it('does not show error when hasError is false and no error text', () => {
      const { queryByTestId } = render(<Input label="Field" hasError={false} />);

      expect(queryByTestId('error-label')).toBeNull();
    });
  });

  describe('size variants', () => {
    it('renders default variant correctly', () => {
      const { getByPlaceholderText } = render(<Input placeholder="Default input" />);
      
      const input = getByPlaceholderText('Default input');
      expect(input.props.className).toContain('h-12 text-lg');
    });

    it('renders small variant correctly', () => {
      const { getByPlaceholderText } = render(<Input placeholder="Small input" variant="small" />);
      
      const input = getByPlaceholderText('Small input');
      expect(input.props.className).toContain('text-md h-10');
    });
  });

  describe('left and right components', () => {
    it('renders left component correctly', () => {
      const LeftIcon = () => <text testID="left-icon">🔍</text>;
      const { getByTestId } = render(<Input placeholder="Search" left={<LeftIcon />} />);
      
      expect(getByTestId('left-icon')).toBeTruthy();
    });

    it('renders right component correctly', () => {
      const RightButton = () => <text testID="right-button">Clear</text>;
      const { getByTestId } = render(<Input placeholder="Input" right={<RightButton />} />);
      
      expect(getByTestId('right-button')).toBeTruthy();
    });

    it('renders both left and right components', () => {
      const LeftIcon = () => <text testID="left-icon">🔍</text>;
      const RightButton = () => <text testID="right-button">Clear</text>;
      const { getByTestId } = render(
        <Input 
          placeholder="Search" 
          left={<LeftIcon />} 
          right={<RightButton />} 
        />
      );
      
      expect(getByTestId('left-icon')).toBeTruthy();
      expect(getByTestId('right-button')).toBeTruthy();
    });
  });

  describe('clear button', () => {
    it('renders clear button when showClearButton is true and has value', () => {
      const { UNSAFE_getByType } = render(
        <Input placeholder="Input" showClearButton value="some text" onChangeText={jest.fn()} />
      );
      
      const { TouchableOpacity } = require('react-native');
      expect(UNSAFE_getByType(TouchableOpacity)).toBeTruthy();
    });

    it('does not render clear button when showClearButton is true but no value', () => {
      const { UNSAFE_queryByType } = render(
        <Input placeholder="Input" showClearButton value="" onChangeText={jest.fn()} />
      );
      
      // When there's no value, the clear button should not render at all
      const { TouchableOpacity } = require('react-native');
      expect(UNSAFE_queryByType(TouchableOpacity)).toBeNull();
    });

    it('does not render clear button when showClearButton is false', () => {
      const { UNSAFE_queryByType } = render(
        <Input placeholder="Input" showClearButton={false} value="some text" onChangeText={jest.fn()} />
      );
      
      // Similar check - no clear button when disabled
      const { TouchableOpacity } = require('react-native');
      expect(UNSAFE_queryByType(TouchableOpacity)).toBeNull();
    });

    it('calls onChangeText with empty string when clear button is pressed', () => {
      const mockOnChangeText = jest.fn();
      const { UNSAFE_getByType } = render(
        <Input 
          placeholder="Input" 
          showClearButton 
          value="some text" 
          onChangeText={mockOnChangeText} 
        />
      );
      
      const { TouchableOpacity } = require('react-native');
      const clearButton = UNSAFE_getByType(TouchableOpacity);
      fireEvent.press(clearButton);
      
      expect(mockOnChangeText).toHaveBeenCalledWith('');
    });
  });

  describe('combined features', () => {
    it('renders small variant with left icon and clear button', () => {
      const LeftIcon = () => <text testID="left-icon">🔍</text>;
      const mockOnChangeText = jest.fn();
      const { getByTestId, getByPlaceholderText, UNSAFE_getByType } = render(
        <Input 
          placeholder="Search" 
          variant="small"
          left={<LeftIcon />}
          showClearButton
          value="search term"
          onChangeText={mockOnChangeText}
        />
      );
      
      expect(getByTestId('left-icon')).toBeTruthy();
      
      const { TouchableOpacity } = require('react-native');
      expect(UNSAFE_getByType(TouchableOpacity)).toBeTruthy();
      
      const input = getByPlaceholderText('Search');
      expect(input.props.className).toContain('text-md h-10');
    });

    it('works correctly with multiline and all features', () => {
      const LeftIcon = () => <text testID="left-icon">📝</text>;
      const RightButton = () => <text testID="right-button">Send</text>;
      const { getByTestId, getByPlaceholderText, UNSAFE_getByType } = render(
        <Input 
          placeholder="Write message..."
          multiline
          left={<LeftIcon />}
          right={<RightButton />}
          showClearButton
          value="message"
          onChangeText={jest.fn()}
        />
      );
      
      expect(getByTestId('left-icon')).toBeTruthy();
      expect(getByTestId('right-button')).toBeTruthy();
      
      const { TouchableOpacity } = require('react-native');
      expect(UNSAFE_getByType(TouchableOpacity)).toBeTruthy();
      
      const input = getByPlaceholderText('Write message...');
      expect(input.props.className).toContain('h-24 py-3 text-left');
    });
  });

  describe('accessibility', () => {
    it('supports testID prop', () => {
      const { getByTestId } = render(<Input placeholder="Test" testID="my-input" />);

      expect(getByTestId('my-input')).toBeTruthy();
    });

    it('links label with input for screen readers', () => {
      const { getByText } = render(<Input label="Accessible Input" placeholder="Type here" />);

      expect(getByText('Accessible Input')).toBeTruthy();
    });
  });
});
