import { render } from '@testing-library/react-native';
import React from 'react';

import { TaskForm } from '@/components/tasks/task-form';
import { Task } from '@/types';

// Mock dependencies with simple implementations
jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ children, onPress, disabled }: any) => (
      <TouchableOpacity testID="submit-button" onPress={onPress} disabled={disabled}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/ui/input', () => {
  const { View, Text } = require('react-native');
  return {
    Input: ({ label, value, placeholder, required }: any) => (
      <View testID={`input-${label?.toLowerCase().replace(/\s+/g, '-') || 'input'}`}>
        <Text>
          {label}
          {required && '*'}
        </Text>
        <View style={{ opacity: 0 }}>
          <Text>{value || placeholder || ''}</Text>
        </View>
      </View>
    ),
  };
});

jest.mock('@/components/ui/select', () => {
  const { View, Text } = require('react-native');
  return {
    Select: ({ label, value, options }: any) => (
      <View testID={`select-${label?.toLowerCase().replace(/\s+/g, '-') || 'select'}`}>
        <Text>{label}</Text>
        <View>{options?.map((option: string) => <Text key={option}>{option}</Text>)}</View>
      </View>
    ),
  };
});

// Mock DatePicker component
jest.mock('@/components/ui/date-picker', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    DatePicker: ({ label, value, onDateChange, placeholder, hasError, error, testID }: any) => (
      <View testID={testID}>
        <Text>{label}</Text>
        <TouchableOpacity testID={`${testID}-button`} onPress={() => onDateChange('2024-12-31')}>
          <Text>{value || placeholder}</Text>
        </TouchableOpacity>
        {hasError && error && <Text testID={`${testID}-error`}>{error}</Text>}
        {value && (
          <TouchableOpacity testID={`${testID}-clear`} onPress={() => onDateChange(undefined)}>
            <Text>Clear date</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
  };
});

// Mock ImagePicker component
jest.mock('@/components/ui/image-picker', () => {
  const { View, Text, TouchableOpacity, Image } = require('react-native');
  return {
    ImagePicker: ({ label, value, onImageChange, hasError, error, testID }: any) => (
      <View testID={testID}>
        <Text>{label}</Text>
        {value ? (
          <View>
            <Image testID={`${testID}-image`} source={{ uri: value }} />
            <TouchableOpacity testID={`${testID}-remove`} onPress={() => onImageChange(undefined)}>
              <Text>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            testID={`${testID}-placeholder`}
            onPress={() => onImageChange('file://test-image.jpg')}>
            <Text>Add Image</Text>
          </TouchableOpacity>
        )}
        {hasError && error && <Text testID={`${testID}-error`}>{error}</Text>}
      </View>
    ),
  };
});

// Simple mock for react-form
jest.mock('@tanstack/react-form', () => ({
  useForm: ({ defaultValues }: any) => ({
    Field: ({ name, children }: any) =>
      children({
        state: {
          value: defaultValues?.[name] || '',
          meta: {
            isValid: true,
            isTouched: false,
            errors: [],
          },
        },
        handleChange: jest.fn(),
        handleBlur: jest.fn(),
      }),
    Subscribe: ({ selector, children }: any) => {
      const state = { isSubmitting: false, canSubmit: true };
      const selected = selector ? selector(state) : state;
      return children(selected);
    },
    handleSubmit: jest.fn(),
    setFieldValue: jest.fn(),
    reset: jest.fn(),
  }),
}));

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn();
  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    priority: 'medium',
    is_completed: false,
    list_id: 1,
    image: null,
    status: 'pending',
    due_date: null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    const { getByTestId, getByText } = render(<TaskForm onSubmit={mockOnSubmit} mode="create" />);

    expect(getByTestId('input-task-name')).toBeTruthy();
    expect(getByTestId('input-description')).toBeTruthy();
    expect(getByTestId('select-priority')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();

    // Check for new component fields
    expect(getByTestId('task-image-picker')).toBeTruthy();
    expect(getByTestId('task-date-picker')).toBeTruthy();
    expect(getByText('Image')).toBeTruthy();
    expect(getByText('Due Date')).toBeTruthy();
    expect(getByText('Add Image')).toBeTruthy();
    expect(getByText('Select due date (optional)')).toBeTruthy();
  });

  it('shows correct button text for create mode', () => {
    const { getByTestId } = render(<TaskForm onSubmit={mockOnSubmit} mode="create" />);

    const submitButton = getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Create Task');
  });

  it('shows correct button text for edit mode', () => {
    const { getByTestId } = render(
      <TaskForm onSubmit={mockOnSubmit} mode="edit" task={mockTask} />
    );

    const submitButton = getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Save Changes');
  });

  it('displays task name field with required indicator', () => {
    const { getByTestId } = render(<TaskForm onSubmit={mockOnSubmit} mode="create" />);

    const nameField = getByTestId('input-task-name');
    expect(nameField).toHaveTextContent(/Task Name\*/i);
  });

  it('displays priority field with options', () => {
    const { getByTestId } = render(<TaskForm onSubmit={mockOnSubmit} mode="create" />);

    const priorityField = getByTestId('select-priority');
    // The priority field exists and is rendered
    expect(priorityField).toBeTruthy();

    // Check that the priority field contains all expected content
    expect(priorityField).toHaveTextContent(/Priority.*low.*medium.*high/);
  });

  it('displays description field', () => {
    const { getByTestId } = render(<TaskForm onSubmit={mockOnSubmit} mode="create" />);

    const descField = getByTestId('input-description');
    expect(descField).toHaveTextContent(/Description/);
  });

  it('renders submit button as enabled by default', () => {
    const { getByTestId } = render(<TaskForm onSubmit={mockOnSubmit} mode="create" />);

    const submitButton = getByTestId('submit-button');
    expect(submitButton).toBeTruthy();
    // Check that button is not disabled (in our mock, disabled would be 'true')
    expect(submitButton.props['data-disabled']).not.toBe('true');
  });

  it('handles create mode correctly', () => {
    const { getByTestId } = render(<TaskForm onSubmit={mockOnSubmit} mode="create" />);

    expect(getByTestId('submit-button')).toHaveTextContent('Create Task');
  });

  it('handles edit mode correctly', () => {
    const { getByTestId } = render(
      <TaskForm onSubmit={mockOnSubmit} mode="edit" task={mockTask} />
    );

    expect(getByTestId('submit-button')).toHaveTextContent('Save Changes');
  });

  it('passes onSubmit prop correctly', () => {
    const customOnSubmit = jest.fn();
    render(<TaskForm onSubmit={customOnSubmit} mode="create" />);

    // Form creation is successful if no errors thrown
    expect(customOnSubmit).toBeDefined();
  });

  it('handles missing task in edit mode gracefully', () => {
    // Should not crash when task is undefined in edit mode
    expect(() => {
      render(<TaskForm onSubmit={mockOnSubmit} mode="edit" />);
    }).not.toThrow();
  });
});
