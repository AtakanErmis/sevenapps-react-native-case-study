import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { Modal } from '@/components/ui/modal';

describe('Modal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <Text>Modal Content</Text>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when visible', () => {
    const { getByText } = render(<Modal {...defaultProps} />);

    expect(getByText('Test Modal')).toBeTruthy();
    expect(getByText('Modal Content')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('does not render modal when not visible', () => {
    const { queryByText } = render(<Modal {...defaultProps} visible={false} />);

    expect(queryByText('Test Modal')).toBeNull();
    expect(queryByText('Modal Content')).toBeNull();
  });

  it('calls onClose when Cancel button is pressed', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(<Modal {...defaultProps} onClose={mockOnClose} />);

    fireEvent.press(getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with default props', () => {
    const { getByText } = render(<Modal {...defaultProps} />);

    expect(getByText('Test Modal')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders custom children', () => {
    const customChildren = (
      <>
        <Text>Custom Content Line 1</Text>
        <Text>Custom Content Line 2</Text>
      </>
    );

    const { getByText } = render(<Modal {...defaultProps}>{customChildren}</Modal>);

    expect(getByText('Custom Content Line 1')).toBeTruthy();
    expect(getByText('Custom Content Line 2')).toBeTruthy();
  });

  it('renders different titles correctly', () => {
    const { getByText, queryByText } = render(<Modal {...defaultProps} title="Custom Title" />);

    expect(getByText('Custom Title')).toBeTruthy();
    expect(queryByText('Test Modal')).toBeNull();
  });

  describe('presentation and animation', () => {
    it('accepts presentationStyle prop', () => {
      const { getByText } = render(<Modal {...defaultProps} presentationStyle="fullScreen" />);

      expect(getByText('Test Modal')).toBeTruthy();
    });

    it('accepts animationType prop', () => {
      const { getByText } = render(<Modal {...defaultProps} animationType="fade" />);

      expect(getByText('Test Modal')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has accessible Cancel button', () => {
      const { getByText } = render(<Modal {...defaultProps} />);
      const cancelButton = getByText('Cancel');

      expect(cancelButton).toBeTruthy();
    });

    it('displays title for screen readers', () => {
      const { getByText } = render(<Modal {...defaultProps} title="Accessible Modal Title" />);

      expect(getByText('Accessible Modal Title')).toBeTruthy();
    });
  });
});
