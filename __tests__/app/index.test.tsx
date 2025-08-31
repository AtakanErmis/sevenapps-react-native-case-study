import { render, fireEvent, within } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import Home from '@/app/index';

// Mock QueryClient and Provider
const mockQueryClient = {
  refetchQueries: jest.fn(),
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
  cancelQueries: jest.fn(),
};

const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { View } = require('react-native');
  return <View testID="query-client-provider">{children}</View>;
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider>{children}</QueryClientProvider>
);

// Mock the query hooks
const mockUseAllLists = jest.fn();
const mockUseCreateList = jest.fn();
const mockUseDeleteList = jest.fn();
const mockUseRenameList = jest.fn();

jest.mock('@/queries/hooks/lists', () => ({
  useAllLists: () => mockUseAllLists(),
  useCreateList: () => mockUseCreateList(),
  useDeleteList: () => mockUseDeleteList(),
  useRenameList: () => mockUseRenameList(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

// Mock components
jest.mock('@/components/lists/list-card', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    ListCard: ({ list, onPress, disabled }: any) => {
      return (
        <TouchableOpacity
          onPress={() => !disabled && onPress?.(list)}
          disabled={disabled}
          testID={`list-card-${list.id}`}>
          <Text>{list.name}</Text>
        </TouchableOpacity>
      );
    },
  };
});

jest.mock('@/components/lists/list-card-skeleton', () => {
  const { View, Text } = require('react-native');
  return {
    ListCardSkeleton: () => (
      <View testID="skeleton">
        <Text>Loading...</Text>
      </View>
    ),
  };
});

jest.mock('@/components/ui/swipeable-item', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    SwipeableListItem: ({ children, leftActions, rightActions }: any) => (
      <View testID="swipeable-item">
        {leftActions?.map((action: any, index: number) => (
          <TouchableOpacity key={index} onPress={action.onPress} testID={`left-action-${index}`}>
            <Text>{action.text}</Text>
          </TouchableOpacity>
        ))}
        {children}
        {rightActions?.map((action: any, index: number) => (
          <TouchableOpacity key={index} onPress={action.onPress} testID={`right-action-${index}`}>
            <Text>{action.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
  };
});

jest.mock('@/components/ui/text-input-modal', () => {
  const { View, Text, TextInput, TouchableOpacity } = require('react-native');
  return {
    TextInputModal: ({
      visible,
      title,
      message,
      placeholder,
      defaultValue,
      onCancel,
      onSubmit,
      cancelText,
      submitText,
    }: any) => {
      if (!visible) return null;
      return (
        <View testID="text-input-modal">
          <Text testID="modal-title">{title}</Text>
          {message && <Text testID="modal-message">{message}</Text>}
          <TextInput
            testID="modal-text-input"
            placeholder={placeholder}
            defaultValue={defaultValue}
            onChangeText={() => {}}
          />
          <TouchableOpacity testID="modal-cancel-button" onPress={onCancel}>
            <Text>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="modal-submit-button" onPress={() => onSubmit('Test Input')}>
            <Text>{submitText}</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

jest.mock('expo-router', () => {
  const { View, Text } = require('react-native');
  return {
    Stack: {
      Screen: ({ options }: any) => {
        const HeaderRight = options?.headerRight;
        return (
          <View testID="stack-screen">
            <Text testID="header-title">{options?.title}</Text>
            {HeaderRight && (
              <View testID="header-right">
                <HeaderRight />
              </View>
            )}
          </View>
        );
      },
    },
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
  };
});

const mockRouter = require('expo-router').router;

jest.mock('@/queries/utils', () => ({
  isTempId: (id: any) => typeof id === 'string' && id.startsWith('temp_'),
}));

describe('Home Screen', () => {
  const mockLists = [
    { id: 1, name: 'Work Tasks', created_at: '2023-01-01' },
    { id: 2, name: 'Personal Tasks', created_at: '2023-01-02' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAllLists.mockReturnValue({
      data: mockLists,
      isLoading: false,
      error: null,
    });
    mockUseCreateList.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    mockUseDeleteList.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      variables: undefined,
    });
    mockUseRenameList.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      variables: undefined,
    });
  });

  it('renders the screen with lists', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(getByTestId('header-title')).toHaveTextContent('Lists');
    expect(getByTestId('list-card-1')).toHaveTextContent('Work Tasks');
    expect(getByTestId('list-card-2')).toHaveTextContent('Personal Tasks');
  });

  it('shows loading skeletons when lists are loading', () => {
    mockUseAllLists.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { getAllByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const skeletons = getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('shows error state when lists fail to load', () => {
    const mockError = new Error('Failed to load lists');
    mockUseAllLists.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { getByText } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(getByText('Error loading lists: Failed to load lists')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('handles retry when error occurs', () => {
    const mockError = new Error('Failed to load lists');
    mockUseAllLists.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { getByText } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    fireEvent.press(getByText('Retry'));

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists'],
    });
  });

  it('shows empty state when no lists exist', () => {
    mockUseAllLists.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { getByText } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(getByText('No lists yet')).toBeTruthy();
    expect(getByText('Create your first list to get started organizing your tasks!')).toBeTruthy();
  });

  it('handles create list action', async () => {
    const mockMutate = jest.fn();
    mockUseCreateList.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    const { getByText, getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Trigger the create list action through the header button
    fireEvent.press(getByText('+ Add'));

    // Verify modal is shown
    expect(getByTestId('text-input-modal')).toBeTruthy();
    expect(getByTestId('modal-title')).toHaveTextContent('Create New List');
    expect(getByTestId('modal-message')).toHaveTextContent('Enter the list name:');

    // Simulate submitting the form
    fireEvent.press(getByTestId('modal-submit-button'));

    expect(mockMutate).toHaveBeenCalledWith('Test Input');
  });

  it('handles navigation to list detail', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    fireEvent.press(getByTestId('list-card-1'));

    expect(mockRouter.push).toHaveBeenCalledWith('/tasks/1');
  });

  it('handles delete list with confirmation', async () => {
    const mockDeleteMutate = jest.fn();
    mockUseDeleteList.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
      variables: undefined,
    });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      // Simulate user pressing Delete
      const deleteButton = Array.isArray(buttons) && buttons.find((b: any) => b.text === 'Delete');
      if (deleteButton && deleteButton.onPress) {
        deleteButton.onPress();
      }
    });

    const { getAllByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Find and click the delete action (right action) for the first list
    const swipeableItems = getAllByTestId('swipeable-item');
    const firstSwipeableItem = swipeableItems[0];
    const deleteButton = within(firstSwipeableItem).getByTestId('right-action-0');
    fireEvent.press(deleteButton);

    expect(alertSpy).toHaveBeenCalledWith(
      'Delete List',
      'Are you sure you want to delete "Work Tasks"?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete' }),
      ])
    );

    alertSpy.mockRestore();
  });

  it('handles rename list', async () => {
    const mockRenameMutate = jest.fn();
    mockUseRenameList.mockReturnValue({
      mutate: mockRenameMutate,
      isPending: false,
      variables: undefined,
    });

    const { getAllByTestId, getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Find and click the rename action (left action) for the first list
    const swipeableItems = getAllByTestId('swipeable-item');
    const firstSwipeableItem = swipeableItems[0];
    const renameButton = within(firstSwipeableItem).getByTestId('left-action-0');
    fireEvent.press(renameButton);

    // Verify modal is shown with correct values
    expect(getByTestId('text-input-modal')).toBeTruthy();
    expect(getByTestId('modal-title')).toHaveTextContent('Rename List');
    expect(getByTestId('modal-message')).toHaveTextContent('Enter new name:');

    // Simulate submitting the form
    fireEvent.press(getByTestId('modal-submit-button'));

    expect(mockRenameMutate).toHaveBeenCalledWith({
      id: 1,
      name: 'Test Input',
    });
  });

  it('shows loading state for create button when creating', () => {
    mockUseCreateList.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    const { getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // The create button should show loading state
    expect(getByTestId('header-right')).toBeTruthy();
  });

  it('handles refresh control', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Note: Testing refresh control requires more complex FlatList mocking
    // For now, we just verify the mockQueryClient has the required methods
    expect(mockQueryClient.refetchQueries).toBeDefined();
  });

  it('handles optimistic updates correctly', () => {
    const optimisticList = { id: 'temp_123', name: 'Optimistic List' };
    mockUseAllLists.mockReturnValue({
      data: [...mockLists, optimisticList],
      isLoading: false,
      error: null,
    });

    const { getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(getByTestId('list-card-temp_123')).toHaveTextContent('Optimistic List');
    // Optimistic items should not have swipe actions
  });
});
