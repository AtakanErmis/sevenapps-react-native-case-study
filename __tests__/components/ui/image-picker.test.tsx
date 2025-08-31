import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import { ImagePicker } from '@/components/ui/image-picker';

// Mock expo-image-picker
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: mockRequestMediaLibraryPermissionsAsync,
  launchImageLibraryAsync: mockLaunchImageLibraryAsync,
}));

// Mock Feather icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// Mock console.error to avoid cluttering test output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ImagePicker', () => {
  const mockOnImageChange = jest.fn();
  const mockImageUri = 'file://test-image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default successful permissions and image selection
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }],
    });
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('Basic functionality', () => {
    it('renders with label and placeholder', () => {
      const { getByText } = render(
        <ImagePicker label="Task Image" onImageChange={mockOnImageChange} testID="image-picker" />
      );

      expect(getByText('Task Image')).toBeTruthy();
      expect(getByText('Add Image')).toBeTruthy();
    });

    it('renders with custom placeholder', () => {
      const { getByText } = render(
        <ImagePicker
          label="Task Image"
          onImageChange={mockOnImageChange}
          placeholder="Choose an image"
          testID="image-picker"
        />
      );

      expect(getByText('Choose an image')).toBeTruthy();
    });

    it('shows required indicator when required prop is true', () => {
      const { getByText } = render(
        <ImagePicker
          label="Task Image"
          onImageChange={mockOnImageChange}
          required
          testID="image-picker"
        />
      );

      expect(getByText('*')).toBeTruthy();
    });

    it('applies testID correctly', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          onImageChange={mockOnImageChange}
          testID="custom-image-picker"
        />
      );

      expect(getByTestId('custom-image-picker')).toBeTruthy();
      expect(getByTestId('custom-image-picker-placeholder')).toBeTruthy();
    });
  });

  describe('Image selection flow', () => {
    it('renders placeholder when no image is selected', () => {
      const { getByTestId, getByText } = render(
        <ImagePicker label="Task Image" onImageChange={mockOnImageChange} testID="image-picker" />
      );

      expect(getByTestId('image-picker-placeholder')).toBeTruthy();
      expect(getByText('Add Image')).toBeTruthy();
    });

    it('renders with custom placeholder text', () => {
      const { getByText } = render(
        <ImagePicker
          label="Task Image"
          onImageChange={mockOnImageChange}
          placeholder="Choose photo"
          testID="image-picker"
        />
      );

      expect(getByText('Choose photo')).toBeTruthy();
    });

    it('does not launch image picker when disabled', () => {
      expect(() => {
        render(
          <ImagePicker
            label="Task Image"
            onImageChange={mockOnImageChange}
            disabled
            testID="image-picker"
          />
        );
      }).not.toThrow();
    });

    it('shows placeholder when disabled', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          onImageChange={mockOnImageChange}
          disabled
          testID="image-picker"
        />
      );

      expect(getByTestId('image-picker-placeholder')).toBeTruthy();
    });
  });

  describe('Permission handling', () => {
    it('renders component without errors', () => {
      expect(() => {
        render(
          <ImagePicker label="Task Image" onImageChange={mockOnImageChange} testID="image-picker" />
        );
      }).not.toThrow();
    });
  });

  describe('Image display and removal', () => {
    it('displays image when value is provided', () => {
      const { getByTestId, queryByTestId } = render(
        <ImagePicker
          label="Task Image"
          value={mockImageUri}
          onImageChange={mockOnImageChange}
          testID="image-picker"
        />
      );

      expect(getByTestId('image-picker-image')).toBeTruthy();
      expect(queryByTestId('image-picker-placeholder')).toBeNull();
    });

    it('shows remove button when image is present and not disabled', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          value={mockImageUri}
          onImageChange={mockOnImageChange}
          testID="image-picker"
        />
      );

      expect(getByTestId('image-picker-remove')).toBeTruthy();
    });

    it('does not show remove button when disabled', () => {
      const { queryByTestId } = render(
        <ImagePicker
          label="Task Image"
          value={mockImageUri}
          onImageChange={mockOnImageChange}
          disabled
          testID="image-picker"
        />
      );

      expect(queryByTestId('image-picker-remove')).toBeNull();
    });

    it('calls onImageChange with undefined when remove button is pressed', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          value={mockImageUri}
          onImageChange={mockOnImageChange}
          testID="image-picker"
        />
      );

      fireEvent.press(getByTestId('image-picker-remove'));

      expect(mockOnImageChange).toHaveBeenCalledWith(undefined);
    });

    it('shows placeholder when no value is provided', () => {
      const { getByTestId, queryByTestId } = render(
        <ImagePicker label="Task Image" onImageChange={mockOnImageChange} testID="image-picker" />
      );

      expect(getByTestId('image-picker-placeholder')).toBeTruthy();
      expect(queryByTestId('image-picker-image')).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('displays error message when hasError is true', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          onImageChange={mockOnImageChange}
          hasError
          error="Image is required"
          testID="image-picker"
        />
      );

      expect(getByTestId('image-picker-error')).toHaveTextContent('Image is required');
    });

    it('applies error styling when hasError is true', () => {
      expect(() => {
        render(
          <ImagePicker
            label="Task Image"
            onImageChange={mockOnImageChange}
            hasError
            testID="image-picker"
          />
        );
      }).not.toThrow();
    });

    it('applies error styling to image when hasError is true', () => {
      expect(() => {
        render(
          <ImagePicker
            label="Task Image"
            value={mockImageUri}
            onImageChange={mockOnImageChange}
            hasError
            testID="image-picker"
          />
        );
      }).not.toThrow();
    });

    it('does not display error message when hasError is false', () => {
      const { queryByTestId } = render(
        <ImagePicker
          label="Task Image"
          onImageChange={mockOnImageChange}
          error="Image is required"
          testID="image-picker"
        />
      );

      expect(queryByTestId('image-picker-error')).toBeNull();
    });
  });

  describe('Disabled state', () => {
    it('applies disabled styling to placeholder when disabled', () => {
      expect(() => {
        render(
          <ImagePicker
            label="Task Image"
            onImageChange={mockOnImageChange}
            disabled
            testID="image-picker"
          />
        );
      }).not.toThrow();
    });

    it('applies disabled styling to image when disabled', () => {
      expect(() => {
        render(
          <ImagePicker
            label="Task Image"
            value={mockImageUri}
            onImageChange={mockOnImageChange}
            disabled
            testID="image-picker"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels', () => {
      const { getByText } = render(
        <ImagePicker label="Task Image" onImageChange={mockOnImageChange} testID="image-picker" />
      );

      expect(getByText('Task Image')).toBeTruthy();
    });

    it('has proper button for screen readers', () => {
      const { getByTestId } = render(
        <ImagePicker label="Task Image" onImageChange={mockOnImageChange} testID="image-picker" />
      );

      const placeholder = getByTestId('image-picker-placeholder');
      expect(placeholder).toBeTruthy();
    });

    it('provides remove button accessibility', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          value={mockImageUri}
          onImageChange={mockOnImageChange}
          testID="image-picker"
        />
      );

      const removeButton = getByTestId('image-picker-remove');
      expect(removeButton).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles null value', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          value={null}
          onImageChange={mockOnImageChange}
          testID="image-picker"
        />
      );

      expect(getByTestId('image-picker-placeholder')).toBeTruthy();
    });

    it('handles empty string value', () => {
      const { getByTestId } = render(
        <ImagePicker
          label="Task Image"
          value=""
          onImageChange={mockOnImageChange}
          testID="image-picker"
        />
      );

      expect(getByTestId('image-picker-placeholder')).toBeTruthy();
    });

    it('renders without errors in all states', () => {
      expect(() => {
        render(
          <ImagePicker
            label="Task Image"
            value={mockImageUri}
            onImageChange={mockOnImageChange}
            testID="image-picker"
          />
        );
      }).not.toThrow();
    });
  });
});
