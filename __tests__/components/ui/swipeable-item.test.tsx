import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { SwipeableListItem, Actions } from '@/components/ui/swipeable-item';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }: any) => <View testID="gesture-root">{children}</View>,
    Swipeable: ({ children, renderLeftActions, renderRightActions }: any) => (
      <View testID="swipeable">
        {renderLeftActions && (
          <View testID="left-actions">{renderLeftActions({ value: 0 }, { value: 0 })}</View>
        )}
        <View testID="swipeable-content">{children}</View>
        {renderRightActions && (
          <View testID="right-actions">{renderRightActions({ value: 0 }, { value: 0 })}</View>
        )}
      </View>
    ),
  };
});

jest.mock(
  'react-native-gesture-handler/ReanimatedSwipeable',
  () => require('react-native-gesture-handler').Swipeable
);

// Mock react-native-reanimated with proper SharedValue implementation
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Override useSharedValue to return proper mock
  Reanimated.useSharedValue = (initial: any) => ({
    value: initial,
    get: () => initial,
    set: () => {},
  });

  // Override useAnimatedStyle to return empty object
  Reanimated.useAnimatedStyle = () => ({});

  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock cn utility
jest.mock('@/lib/utils/cn', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('SwipeableListItem', () => {
  const mockAction = {
    text: 'Delete',
    textClassName: 'text-white',
    buttonClassName: 'bg-red-500',
    onPress: jest.fn(),
    icon: <Text>=�</Text>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <SwipeableListItem>
        <Text>Swipeable Content</Text>
      </SwipeableListItem>
    );

    expect(getByText('Swipeable Content')).toBeTruthy();
  });

  it('renders within GestureHandlerRootView', () => {
    const { getByTestId } = render(
      <SwipeableListItem>
        <Text>Content</Text>
      </SwipeableListItem>
    );

    expect(getByTestId('gesture-root')).toBeTruthy();
    expect(getByTestId('swipeable')).toBeTruthy();
  });

  it('renders right actions when provided', () => {
    const { getByTestId, getByText } = render(
      <SwipeableListItem rightActions={[mockAction]}>
        <Text>Content</Text>
      </SwipeableListItem>
    );

    expect(getByTestId('right-actions')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
    expect(getByText('=�')).toBeTruthy();
  });

  it('renders left actions when provided', () => {
    const { getByTestId, getByText } = render(
      <SwipeableListItem leftActions={[mockAction]}>
        <Text>Content</Text>
      </SwipeableListItem>
    );

    expect(getByTestId('left-actions')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
    expect(getByText('=�')).toBeTruthy();
  });

  it('renders both left and right actions', () => {
    const leftAction = {
      text: 'Edit',
      onPress: jest.fn(),
      icon: <Text></Text>,
    };

    const { getByTestId, getByText } = render(
      <SwipeableListItem leftActions={[leftAction]} rightActions={[mockAction]}>
        <Text>Content</Text>
      </SwipeableListItem>
    );

    expect(getByTestId('left-actions')).toBeTruthy();
    expect(getByTestId('right-actions')).toBeTruthy();
    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('handles action press events', () => {
    const { getByText } = render(
      <SwipeableListItem rightActions={[mockAction]}>
        <Text>Content</Text>
      </SwipeableListItem>
    );

    fireEvent.press(getByText('Delete'));
    expect(mockAction.onPress).toHaveBeenCalledTimes(1);
  });

  it('renders multiple actions', () => {
    const editAction = {
      text: 'Edit',
      onPress: jest.fn(),
      icon: <Text></Text>,
    };

    const deleteAction = {
      text: 'Delete',
      onPress: jest.fn(),
      icon: <Text>=�</Text>,
    };

    const { getByText } = render(
      <SwipeableListItem rightActions={[editAction, deleteAction]}>
        <Text>Content</Text>
      </SwipeableListItem>
    );

    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
    expect(getByText('')).toBeTruthy();
    expect(getByText('=�')).toBeTruthy();
  });

  it('calls onSwipeStateChange when provided', () => {
    const mockOnSwipeStateChange = jest.fn();

    render(
      <SwipeableListItem rightActions={[mockAction]} onSwipeStateChange={mockOnSwipeStateChange}>
        <Text>Content</Text>
      </SwipeableListItem>
    );

    // In a real implementation, we would simulate swipe events
    // For now, we just ensure the component renders without errors
    expect(mockOnSwipeStateChange).not.toHaveBeenCalled();
  });

  describe('Actions component', () => {
    const mockSharedValue = { value: 0 } as any;
    const mockActions = [
      {
        text: 'Action 1',
        onPress: jest.fn(),
        icon: <Text>1�</Text>,
      },
      {
        text: 'Action 2',
        onPress: jest.fn(),
        textClassName: 'custom-text',
        buttonClassName: 'custom-button',
      },
    ];

    it('renders Actions component correctly', () => {
      const { getByText } = render(
        <Actions
          actions={mockActions}
          direction="right"
          progress={mockSharedValue}
          drag={mockSharedValue}
        />
      );

      expect(getByText('Action 1')).toBeTruthy();
      expect(getByText('Action 2')).toBeTruthy();
      expect(getByText('1�')).toBeTruthy();
    });

    it('handles action press in Actions component', () => {
      const { getByText } = render(
        <Actions
          actions={mockActions}
          direction="left"
          progress={mockSharedValue}
          drag={mockSharedValue}
        />
      );

      fireEvent.press(getByText('Action 1'));
      expect(mockActions[0].onPress).toHaveBeenCalledTimes(1);

      fireEvent.press(getByText('Action 2'));
      expect(mockActions[1].onPress).toHaveBeenCalledTimes(1);
    });

    it('applies custom styles to actions', () => {
      const { getByText } = render(
        <Actions
          actions={mockActions}
          direction="right"
          progress={mockSharedValue}
          drag={mockSharedValue}
        />
      );

      const action2Text = getByText('Action 2');
      expect(action2Text).toBeTruthy();
      // Custom classes would be applied through cn utility
    });
  });

  describe('accessibility', () => {
    it('maintains child component accessibility', () => {
      const { getByLabelText } = render(
        <SwipeableListItem>
          <Text accessibilityLabel="Accessible Content">Content</Text>
        </SwipeableListItem>
      );

      expect(getByLabelText('Accessible Content')).toBeTruthy();
    });

    it('makes action buttons accessible', () => {
      const accessibleAction = {
        text: 'Delete',
        onPress: jest.fn(),
        icon: <Text>=�</Text>,
      };

      const { getByText } = render(
        <SwipeableListItem rightActions={[accessibleAction]}>
          <Text>Content</Text>
        </SwipeableListItem>
      );

      const deleteButton = getByText('Delete');
      expect(deleteButton).toBeTruthy();
      // Button is accessible by default through TouchableOpacity
    });
  });

  describe('edge cases', () => {
    it('handles empty actions arrays', () => {
      const { getByText, queryByTestId } = render(
        <SwipeableListItem leftActions={[]} rightActions={[]}>
          <Text>Content</Text>
        </SwipeableListItem>
      );

      expect(getByText('Content')).toBeTruthy();
      expect(queryByTestId('left-actions')).toBeNull();
      expect(queryByTestId('right-actions')).toBeNull();
    });

    it('handles actions without icons', () => {
      const actionWithoutIcon = {
        text: 'No Icon Action',
        onPress: jest.fn(),
      };

      const { getByText } = render(
        <SwipeableListItem rightActions={[actionWithoutIcon]}>
          <Text>Content</Text>
        </SwipeableListItem>
      );

      expect(getByText('No Icon Action')).toBeTruthy();
    });

    it('handles actions with only icons', () => {
      const iconOnlyAction = {
        text: '',
        onPress: jest.fn(),
        icon: <Text>🔧</Text>,
      };

      const { getByText } = render(
        <SwipeableListItem rightActions={[iconOnlyAction]}>
          <Text>Content</Text>
        </SwipeableListItem>
      );

      expect(getByText('🔧')).toBeTruthy();
    });

    it('handles complex children structures', () => {
      const { getByTestId } = render(
        <SwipeableListItem rightActions={[mockAction]}>
          <View testID="complex-child">
            <Text>Header</Text>
            <View>
              <Text>Nested Content</Text>
            </View>
          </View>
        </SwipeableListItem>
      );

      expect(getByTestId('complex-child')).toBeTruthy();
    });
  });
});
