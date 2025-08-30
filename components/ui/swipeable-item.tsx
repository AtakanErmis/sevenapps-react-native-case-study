import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { cn } from '@/lib/utils/cn';

interface SwipeAction {
  text: string;
  textClassName?: string;
  buttonClassName?: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

interface SwipeableListItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStateChange?: (isOpen: boolean) => void;
}

export const Actions = ({
  actions,
  direction,
  progress,
  drag,
}: {
  actions: SwipeAction[];
  direction: 'left' | 'right';
  progress: SharedValue<number>;
  drag: SharedValue<number>;
}) => {
  const [viewLength, setViewLength] = useState(0);

  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: direction === 'right' ? drag.value + viewLength : drag.value - viewLength,
        },
      ],
    };
  });

  return (
    <Reanimated.View
      onLayout={(e) => setViewLength(e.nativeEvent.layout.width)}
      className={styles.actionsContainer}
      style={styleAnimation}>
      {actions.map((action, index) => {
        return (
          <TouchableOpacity
            key={index}
            className={cn([styles.actionButton, action.buttonClassName])}
            onPress={action.onPress}>
            {action.icon}
            <Text className={cn('text-center', action.textClassName)}>{action.text}</Text>
          </TouchableOpacity>
        );
      })}
    </Reanimated.View>
  );
};

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStateChange,
}) => {
  return (
    <GestureHandlerRootView>
      <View className={styles.container}>
        <Swipeable
          friction={2}
          enableTrackpadTwoFingerGesture
          renderRightActions={
            rightActions.length > 0
              ? (progressAnimatedValue, dragAnimatedValue) => (
                  <Actions
                    actions={rightActions}
                    direction="right"
                    progress={progressAnimatedValue}
                    drag={dragAnimatedValue}
                  />
                )
              : undefined
          }
          renderLeftActions={
            leftActions.length > 0
              ? (progressAnimatedValue, dragAnimatedValue) => (
                  <Actions
                    actions={leftActions}
                    direction="left"
                    progress={progressAnimatedValue}
                    drag={dragAnimatedValue}
                  />
                )
              : undefined
          }
          onSwipeableOpen={() => onSwipeStateChange?.(true)}
          onSwipeableClose={() => onSwipeStateChange?.(false)}>
          {children}
        </Swipeable>
      </View>
    </GestureHandlerRootView>
  );
};

SwipeableListItem.displayName = 'SwipeableListItem';

const styles = {
  actionsContainer: 'flex-row items-center gap-1 px-2',
  actionButton: 'items-center justify-center rounded-xl p-2 h-full min-w-16 gap-1',
  container: 'overflow-hidden',
};
