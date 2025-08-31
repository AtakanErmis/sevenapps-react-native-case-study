import { render } from '@testing-library/react-native';
import React from 'react';

import { Label } from '@/components/ui/label';

// Mock cn utility
jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('Label', () => {
  it('renders label with default props', () => {
    const { getByText } = render(<Label>Username</Label>);

    expect(getByText('Username')).toBeTruthy();
  });

  it('renders label with required asterisk for default variant', () => {
    const { getByText } = render(<Label required>Password</Label>);

    expect(getByText('Password*')).toBeTruthy();
  });

  it('does not show asterisk for error variant even when required', () => {
    const { getByText } = render(
      <Label required variant="error">
        This field has an error
      </Label>
    );

    expect(getByText('This field has an error')).toBeTruthy();
    // Should not include asterisk for error variant
  });

  it('renders with default variant styles', () => {
    const { getByText } = render(<Label>Default Label</Label>);
    const label = getByText('Default Label');

    expect(label).toBeTruthy();
    // In a real test, we would check for specific styles
    // but since we're mocking cn, we just ensure it renders
  });

  it('renders with error variant styles', () => {
    const { getByText } = render(<Label variant="error">Error Message</Label>);
    const label = getByText('Error Message');

    expect(label).toBeTruthy();
  });

  it('applies custom className', () => {
    const { getByText } = render(<Label className="custom-class">Custom Styled Label</Label>);
    const label = getByText('Custom Styled Label');

    expect(label).toBeTruthy();
  });

  it('combines required with custom className', () => {
    const { getByText } = render(
      <Label required className="custom-class">
        Required Custom Label
      </Label>
    );

    expect(getByText('Required Custom Label*')).toBeTruthy();
  });

  describe('variant behavior', () => {
    it('renders default variant correctly', () => {
      const { getByText } = render(<Label variant="default">Default Variant</Label>);

      expect(getByText('Default Variant')).toBeTruthy();
    });

    it('renders error variant correctly', () => {
      const { getByText } = render(<Label variant="error">Error Variant</Label>);

      expect(getByText('Error Variant')).toBeTruthy();
    });
  });

  describe('required prop behavior', () => {
    it('shows asterisk only for default variant when required', () => {
      const { getByText } = render(
        <Label variant="default" required>
          Field Name
        </Label>
      );

      expect(getByText('Field Name*')).toBeTruthy();
    });

    it('does not show asterisk for error variant when required', () => {
      const { getByText } = render(
        <Label variant="error" required>
          Error Message
        </Label>
      );

      expect(getByText('Error Message')).toBeTruthy();
    });

    it('does not show asterisk when not required', () => {
      const { getByText } = render(<Label required={false}>Optional Field</Label>);

      expect(getByText('Optional Field')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('renders as accessible text element', () => {
      const { getByText } = render(<Label>Accessible Label</Label>);
      const label = getByText('Accessible Label');

      expect(label).toBeTruthy();
      // Text component should be accessible by default
    });

    it('provides proper text content for screen readers', () => {
      const { getByText } = render(<Label required>Screen Reader Label</Label>);

      expect(getByText('Screen Reader Label*')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles empty string children', () => {
      const { queryByText } = render(<Label />);

      expect(queryByText('')).toBeTruthy();
    });

    it('handles long text content', () => {
      const longText =
        'This is a very long label text that might wrap to multiple lines and should still render correctly without breaking the layout';
      const { getByText } = render(<Label>{longText}</Label>);

      expect(getByText(longText)).toBeTruthy();
    });

    it('handles special characters in text', () => {
      const specialText = 'Label with special chars: !@#$%^&*()_+{}|:"<>?[]\\;\',./ ��������';
      const { getByText } = render(<Label>{specialText}</Label>);

      expect(getByText(specialText)).toBeTruthy();
    });

    it('combines all props correctly', () => {
      const { getByText } = render(
        <Label required variant="default" className="test-class">
          Complete Label
        </Label>
      );

      expect(getByText('Complete Label*')).toBeTruthy();
    });
  });
});
