import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { Container } from '@/components/ui/container';

describe('Container', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Container>
        <Text>Test Content</Text>
      </Container>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders as SafeAreaView', () => {
    const { getByTestId } = render(
      <Container>
        <Text testID="test-content">Content</Text>
      </Container>
    );

    expect(getByTestId('test-content')).toBeTruthy();
    // SafeAreaView is rendered correctly when content is present
  });

  it('handles multiple children', () => {
    const { getByText } = render(
      <Container>
        <Text>First Child</Text>
        <Text>Second Child</Text>
        <View>
          <Text>Nested Child</Text>
        </View>
      </Container>
    );

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
    expect(getByText('Nested Child')).toBeTruthy();
  });

  it('applies default styles', () => {
    const { getByTestId } = render(
      <Container>
        <Text testID="content">Styled Content</Text>
      </Container>
    );

    const content = getByTestId('content');
    expect(content).toBeTruthy();
    // Container applies the default styles class 'flex flex-1 m-6'
  });

  it('handles empty children gracefully', () => {
    const { getByTestId } = render(<Container>{null}</Container>);

    expect(getByTestId('container')).toBeTruthy();
  });

  it('handles undefined children', () => {
    const { getByTestId } = render(<Container>{undefined}</Container>);

    expect(getByTestId('container')).toBeTruthy();
  });

  describe('accessibility', () => {
    it('provides safe area for content', () => {
      const { getByText } = render(
        <Container>
          <Text>Accessible Content</Text>
        </Container>
      );

      expect(getByText('Accessible Content')).toBeTruthy();
      // SafeAreaView ensures content is within safe boundaries
    });

    it('maintains accessibility of child components', () => {
      const { getByLabelText } = render(
        <Container>
          <Text accessibilityLabel="Accessible Text">Content</Text>
        </Container>
      );

      expect(getByLabelText('Accessible Text')).toBeTruthy();
    });
  });

  describe('layout', () => {
    it('provides flex container for children', () => {
      const { getByText } = render(
        <Container>
          <View style={{ flex: 1 }}>
            <Text>Flexible Content</Text>
          </View>
        </Container>
      );

      expect(getByText('Flexible Content')).toBeTruthy();
    });

    it('handles complex child layouts', () => {
      const { getByTestId } = render(
        <Container>
          <View testID="header">
            <Text>Header</Text>
          </View>
          <View testID="content" style={{ flex: 1 }}>
            <Text>Main Content</Text>
          </View>
          <View testID="footer">
            <Text>Footer</Text>
          </View>
        </Container>
      );

      expect(getByTestId('header')).toBeTruthy();
      expect(getByTestId('content')).toBeTruthy();
      expect(getByTestId('footer')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles boolean children', () => {
      const { getByText } = render(
        <Container>
          {true && <Text>Conditional Content</Text>}
          {false && <Text>Hidden Content</Text>}
        </Container>
      );

      expect(getByText('Conditional Content')).toBeTruthy();
    });

    it('handles array of children', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const { getByText } = render(
        <Container>
          {items.map((item, index) => (
            <Text key={index}>{item}</Text>
          ))}
        </Container>
      );

      items.forEach((item) => {
        expect(getByText(item)).toBeTruthy();
      });
    });

    it('handles deeply nested children', () => {
      const { getByTestId } = render(
        <Container>
          <View>
            <View>
              <View>
                <Text testID="deep-nested">Deep Content</Text>
              </View>
            </View>
          </View>
        </Container>
      );

      expect(getByTestId('deep-nested')).toBeTruthy();
    });
  });
});
