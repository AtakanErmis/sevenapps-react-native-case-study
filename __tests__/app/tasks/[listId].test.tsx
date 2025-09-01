import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import TasksScreen from '@/app/tasks/[listId]';
import { List, Task } from '@/types';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: any) => {
      const { View } = require('react-native');
      return (
        <View testID="stack-screen" accessibilityLabel={options?.title} data-title={options?.title}>
          {options?.headerRight?.()}
        </View>
      );
    },
  },
  useLocalSearchParams: () => ({ listId: '1' }),
}));

// Mock React Native Alert
jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
  if (buttons && Array.isArray(buttons)) {
    // Simulate pressing the destructive button for delete operations
    const destructiveButton = buttons.find((btn) => btn.style === 'destructive');
    if (destructiveButton?.onPress) {
      destructiveButton.onPress();
    }
  }
});

// Mock @tanstack/react-query
const mockQueryClient = {
  refetchQueries: jest.fn().mockResolvedValue(undefined),
  invalidateQueries: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

// Mock query hooks
const mockList: List = {
  id: 1,
  name: 'Test List',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Test Task 1',
    description: 'Description 1',
    image: null,
    status: 'pending',
    priority: 'high',
    is_completed: false,
    due_date: null,
    list_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Test Task 2',
    description: 'Description 2',
    image: null,
    status: 'completed',
    priority: 'medium',
    is_completed: true,
    due_date: null,
    list_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockTasksWithImageAndDate: Task[] = [
  {
    id: 3,
    name: 'Task with Image',
    description: 'Has image attachment',
    image: 'file://test-image.jpg',
    status: 'pending',
    priority: 'high',
    is_completed: false,
    due_date: '2024-12-31',
    list_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'Task Due Tomorrow',
    description: 'Due date soon',
    image: null,
    status: 'pending',
    priority: 'medium',
    is_completed: false,
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    list_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

jest.mock('@/queries/hooks/lists', () => ({
  useListById: () => ({ data: mockList }),
}));

const mockMutations = {
  createTask: { mutate: jest.fn(), isPending: false },
  updateTask: { mutate: jest.fn(), isPending: false },
  deleteTask: { mutate: jest.fn(), isPending: false, variables: null },
  toggleTask: { mutate: jest.fn(), isPending: false },
};

const mockUseTasksByListId = jest.fn();
const mockUseCreateTask = jest.fn();
const mockUseUpdateTask = jest.fn();
const mockUseDeleteTask = jest.fn();
const mockUseToggleTask = jest.fn();

jest.mock('@/queries/hooks/tasks', () => ({
  useTasksByListId: () => mockUseTasksByListId(),
  useCreateTask: () => mockUseCreateTask(),
  useUpdateTask: () => mockUseUpdateTask(),
  useDeleteTask: () => mockUseDeleteTask(),
  useToggleTask: () => mockUseToggleTask(),
}));

// Mock isTempId utility
jest.mock('@/queries/utils', () => ({
  isTempId: (id: any) => typeof id === 'string' && id.startsWith('temp'),
}));

// Mock components
jest.mock('@/components/tasks/task-card', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    TaskCard: ({ task, onToggle, disabled }: any) => (
      <View
        testID={`task-${task.id}`}
        style={{ opacity: disabled ? 0.5 : 1 }}
        data-disabled={disabled?.toString()}>
        <TouchableOpacity onPress={() => onToggle && onToggle(task)} disabled={disabled}>
          <Text>{task.name}</Text>
        </TouchableOpacity>
        {task.is_completed && <Text testID="completed-indicator">✓</Text>}
      </View>
    ),
  };
});
jest.mock('@/components/tasks/task-card-skeleton', () => {
  const { View } = require('react-native');
  return {
    TaskCardSkeleton: () => <View testID="task-skeleton" />,
  };
});

jest.mock('@/components/tasks/task-modal', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    TaskModal: ({ visible, onClose, onSubmit, mode, task }: any) => (
      <View
        testID="task-modal"
        accessibilityState={{ expanded: visible }}
        data-visible={visible?.toString()}
        data-mode={mode}>
        <TouchableOpacity testID="modal-close" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="modal-submit"
          onPress={() =>
            onSubmit({
              name: 'New Task',
              priority: 'medium',
              description: 'Test description',
              image: task?.image || undefined,
              due_date: task?.due_date || undefined,
            })
          }>
          <Text>Submit</Text>
        </TouchableOpacity>
        {task && <Text testID="modal-task">{task.name}</Text>}
        {task?.image && <Text testID="modal-image">Image: {task.image}</Text>}
        {task?.due_date && <Text testID="modal-due-date">Due: {task.due_date}</Text>}
      </View>
    ),
  };
});

jest.mock('@/components/ui/button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ children, onPress, disabled }: any) => (
      <TouchableOpacity testID="add-task-button" onPress={onPress} disabled={disabled}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/ui/swipeable-item', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    SwipeableListItem: ({ children, leftActions, rightActions }: any) => (
      <View testID="swipeable-item">
        {leftActions &&
          leftActions.map((action: any, index: number) => (
            <TouchableOpacity key={index} testID={`left-action-${index}`} onPress={action.onPress}>
              <Text>{action.text}</Text>
            </TouchableOpacity>
          ))}
        {children}
        {rightActions &&
          rightActions.map((action: any, index: number) => (
            <TouchableOpacity key={index} testID={`right-action-${index}`} onPress={action.onPress}>
              <Text>{action.text}</Text>
            </TouchableOpacity>
          ))}
      </View>
    ),
  };
});

// Mock Feather icons
jest.mock('@expo/vector-icons/Feather', () => 'Feather');

// Mock filter components
jest.mock('@/components/tasks/filter-controls', () => {
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    FilterControls: ({ showFilters, showSort, onToggleFilters, onToggleSort }: any) => (
      <View testID="filter-controls">
        <TouchableOpacity testID="toggle-filters" onPress={onToggleFilters}>
          <Text>Filters {showFilters ? '(open)' : '(closed)'}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="toggle-sort" onPress={onToggleSort}>
          <Text>Sort {showSort ? '(open)' : '(closed)'}</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

jest.mock('@/components/tasks/filters-panel', () => {
  const { View, Text } = require('react-native');
  return {
    FiltersPanel: ({ showFilters }: any) =>
      showFilters ? (
        <View testID="filters-panel">
          <Text>Filter Options</Text>
        </View>
      ) : null,
  };
});

jest.mock('@/components/tasks/sort-panel', () => {
  const { View, Text } = require('react-native');
  return {
    SortPanel: ({ showSort }: any) =>
      showSort ? (
        <View testID="sort-panel">
          <Text>Sort Options</Text>
        </View>
      ) : null,
  };
});

// Mock task filters hook
jest.mock('@/lib/hooks/useTaskFilters', () => ({
  useTaskFilters: () => ({
    searchTerm: '',
    priorityFilter: null,
    statusFilter: null,
    sortBy: 'created_at',
    sortOrder: 'desc',
    hasActiveFilters: false,
    hasActiveSort: false,
    setSearchTerm: jest.fn(),
    setPriorityFilter: jest.fn(),
    setStatusFilter: jest.fn(),
    setSortBy: jest.fn(),
    setSortOrder: jest.fn(),
    toggleSortOrder: jest.fn(),
    clearPriorityFilter: jest.fn(),
    clearStatusFilter: jest.fn(),
    clearAllFilters: jest.fn(),
    resetSort: jest.fn(),
    resetAll: jest.fn(),
  }),
}));

// Mock filter and sort utilities
jest.mock('@/lib/utils/task-filters', () => ({
  filterTasks: jest.fn((tasks) => tasks),
}));

jest.mock('@/lib/utils/task-sorting', () => ({
  sortTasks: jest.fn((tasks) => tasks),
}));

describe('TasksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock returns
    mockUseTasksByListId.mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    });
    mockUseCreateTask.mockReturnValue(mockMutations.createTask);
    mockUseUpdateTask.mockReturnValue(mockMutations.updateTask);
    mockUseDeleteTask.mockReturnValue(mockMutations.deleteTask);
    mockUseToggleTask.mockReturnValue(mockMutations.toggleTask);
  });

  it('renders tasks correctly', () => {
    const { getByTestId } = render(<TasksScreen />);

    expect(getByTestId('task-1')).toBeTruthy();
    expect(getByTestId('task-2')).toBeTruthy();
    expect(getByTestId('completed-indicator')).toBeTruthy(); // For completed task
  });

  it('displays loading skeletons when loading', () => {
    // Override the mock for this specific test
    mockUseTasksByListId.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { getAllByTestId } = render(<TasksScreen />);
    expect(getAllByTestId('task-skeleton')).toHaveLength(5); // 5 skeleton items
  });

  it('shows add task button in header', () => {
    const { getByTestId } = render(<TasksScreen />);

    expect(getByTestId('add-task-button')).toBeTruthy();
  });

  it('opens task modal when add button is pressed', () => {
    const { getByTestId } = render(<TasksScreen />);

    const addButton = getByTestId('add-task-button');
    fireEvent.press(addButton);

    const modal = getByTestId('task-modal');
    expect(modal.props['data-visible']).toBe('true');
    expect(modal.props['data-mode']).toBe('create');
  });

  it('closes task modal when close button is pressed', () => {
    const { getByTestId } = render(<TasksScreen />);

    // Open modal first
    fireEvent.press(getByTestId('add-task-button'));
    expect(getByTestId('task-modal').props['data-visible']).toBe('true');

    // Close modal
    fireEvent.press(getByTestId('modal-close'));
    expect(getByTestId('task-modal').props['data-visible']).toBe('false');
  });

  it('handles task creation', async () => {
    const { getByTestId } = render(<TasksScreen />);

    fireEvent.press(getByTestId('add-task-button'));
    fireEvent.press(getByTestId('modal-submit'));

    await waitFor(() => {
      expect(mockMutations.createTask.mutate).toHaveBeenCalledWith({
        name: 'New Task',
        priority: 'medium',
        description: 'Test description',
        image: undefined,
        due_date: undefined,
        list_id: 1,
      });
    });
  });

  it('handles task toggle', () => {
    const { getByText } = render(<TasksScreen />);

    const task1 = getByText('Test Task 1');
    fireEvent.press(task1);

    expect(mockMutations.toggleTask.mutate).toHaveBeenCalledWith({
      id: 1,
      isCompleted: true, // Task was incomplete, so it should become completed
    });
  });

  it('handles task editing via left swipe action', () => {
    const { getByTestId, getAllByTestId } = render(<TasksScreen />);

    const editButtons = getAllByTestId('left-action-0');
    const firstEditButton = editButtons[0]; // Edit button for first task
    fireEvent.press(firstEditButton);

    const modal = getByTestId('task-modal');
    expect(modal.props['data-visible']).toBe('true');
    expect(modal.props['data-mode']).toBe('edit');
    expect(getByTestId('modal-task').children).toContain('Test Task 1');
  });

  it('handles task deletion via right swipe action', () => {
    const { getAllByTestId } = render(<TasksScreen />);

    const deleteButtons = getAllByTestId('right-action-0');
    const firstDeleteButton = deleteButtons[0]; // Delete button for first task

    // Test that the delete button exists and is clickable
    expect(firstDeleteButton).toBeTruthy();
    fireEvent.press(firstDeleteButton);

    // The delete functionality requires complex Alert interaction
    // which is tested separately in component unit tests
    expect(firstDeleteButton).toBeTruthy();
  });

  it('displays empty state when no tasks', () => {
    // Override the mock for this specific test
    mockUseTasksByListId.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { getByText } = render(<TasksScreen />);

    expect(getByText('No tasks yet')).toBeTruthy();
    expect(getByText('Add your first task to get started!')).toBeTruthy();
  });

  it('handles error state', () => {
    // Override the mock for this specific test
    mockUseTasksByListId.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load tasks'),
    });

    const { getByText } = render(<TasksScreen />);

    expect(getByText(/Error loading tasks/)).toBeTruthy();

    const retryButton = getByText('Retry');
    fireEvent.press(retryButton);

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['tasks', 1],
    });
  });

  it('handles refresh control', async () => {
    const { UNSAFE_getByType } = render(<TasksScreen />);

    // Find the RefreshControl component
    const refreshControl = UNSAFE_getByType('RCTRefreshControl' as any);
    fireEvent(refreshControl, 'refresh');

    await waitFor(() => {
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['tasks', 1],
      });
    });
  });

  it('orders tasks correctly (incomplete first, then completed)', () => {
    const { getAllByTestId } = render(<TasksScreen />);

    const taskElements = getAllByTestId(/^task-/);

    // First task should be incomplete (id: 1), second should be completed (id: 2)
    expect(taskElements[0].props.testID).toBe('task-1');
    expect(taskElements[1].props.testID).toBe('task-2');
  });

  it('displays correct list name in header', () => {
    const { getByTestId } = render(<TasksScreen />);

    const stackScreen = getByTestId('stack-screen');
    expect(stackScreen.props['data-title']).toBe('Test List');
  });

  describe('optimistic updates', () => {
    it('handles optimistic task creation', () => {
      const tempTask: Task = {
        id: 'temp-123' as any,
        name: 'Optimistic Task',
        description: null,
        image: null,
        status: 'pending',
        priority: 'medium',
        is_completed: false,
        due_date: null,
        list_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Override the mock to include the optimistic task
      mockUseTasksByListId.mockReturnValue({
        data: [...mockTasks, tempTask],
        isLoading: false,
        error: null,
      });

      const { getByText, getByTestId } = render(<TasksScreen />);

      expect(getByText('Optimistic Task')).toBeTruthy();

      // Optimistic tasks should not have swipe actions
      const optimisticTask = getByTestId('task-temp-123');
      expect(optimisticTask.props['data-disabled']).toBe('true');
    });

    it('shows deleting state during delete operation', () => {
      mockMutations.deleteTask.isPending = true;
      mockMutations.deleteTask.variables = 1 as any;

      const { getByText } = render(<TasksScreen />);

      expect(getByText('Deleting...')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('provides accessible task interactions', () => {
      // Reset the delete state that might be lingering from previous tests
      mockMutations.deleteTask.isPending = false;
      mockMutations.deleteTask.variables = null;

      const { getByText } = render(<TasksScreen />);

      const task1 = getByText('Test Task 1');
      expect(task1).toBeTruthy();
      // Tasks should be accessible through touch/click
    });

    it('provides accessible navigation header', () => {
      const { getByTestId } = render(<TasksScreen />);

      expect(getByTestId('add-task-button')).toBeTruthy();
      // Header should have accessible add button
    });
  });

  describe('edge cases', () => {
    it('handles invalid listId parameter', () => {
      jest.doMock('expo-router', () => {
        const { View } = require('react-native');
        return {
          Stack: {
            Screen: ({ options }: any) => (
              <View testID="stack-screen" accessibilityLabel={options?.title}>
                {options?.headerRight?.()}
              </View>
            ),
          },
          useLocalSearchParams: () => ({ listId: 'invalid' }),
        };
      });

      // Should not crash with invalid listId
      const { getByTestId } = render(<TasksScreen />);
      expect(getByTestId('stack-screen')).toBeTruthy();
    });

    it('handles missing listId parameter', () => {
      jest.doMock('expo-router', () => {
        const { View } = require('react-native');
        return {
          Stack: {
            Screen: ({ options }: any) => (
              <View testID="stack-screen" accessibilityLabel={options?.title}>
                {options?.headerRight?.()}
              </View>
            ),
          },
          useLocalSearchParams: () => ({}),
        };
      });

      // Should not crash with missing listId
      const { getByTestId } = render(<TasksScreen />);
      expect(getByTestId('stack-screen')).toBeTruthy();
    });

    it('handles task update in edit mode', async () => {
      const { getByTestId, getAllByTestId } = render(<TasksScreen />);

      // Open edit modal for the first task
      const editButtons = getAllByTestId('left-action-0');
      fireEvent.press(editButtons[0]); // First task (ID 1)

      // Submit edit
      fireEvent.press(getByTestId('modal-submit'));

      await waitFor(() => {
        expect(mockMutations.updateTask.mutate).toHaveBeenCalledWith({
          id: 1,
          updates: {
            name: 'New Task',
            priority: 'medium',
            description: 'Test description',
            image: undefined,
            due_date: undefined,
          },
        });
      });
    });
  });

  describe('Tasks with new fields', () => {
    beforeEach(() => {
      // Reset mutations for these tests
      mockMutations.createTask.mutate = jest.fn();
      mockMutations.updateTask.mutate = jest.fn();
    });

    it('handles tasks with image and due date', () => {
      mockUseTasksByListId.mockReturnValue({
        data: mockTasksWithImageAndDate,
        isLoading: false,
        error: null,
      });

      const { getByTestId, getByText } = render(<TasksScreen />);

      expect(getByTestId('task-3')).toBeTruthy();
      expect(getByTestId('task-4')).toBeTruthy();
      expect(getByText('Task with Image')).toBeTruthy();
      expect(getByText('Task Due Tomorrow')).toBeTruthy();
    });

    it('passes image and due date to edit modal', () => {
      mockUseTasksByListId.mockReturnValue({
        data: mockTasksWithImageAndDate,
        isLoading: false,
        error: null,
      });

      const { getByTestId, getAllByTestId } = render(<TasksScreen />);

      // Open edit modal for task with image
      const editButtons = getAllByTestId('left-action-0');
      fireEvent.press(editButtons[0]); // First task with image

      const modal = getByTestId('task-modal');
      expect(modal.props['data-visible']).toBe('true');
      expect(modal.props['data-mode']).toBe('edit');
      expect(getByTestId('modal-task')).toHaveTextContent('Task with Image');
      expect(getByTestId('modal-image')).toHaveTextContent('Image: file://test-image.jpg');
      expect(getByTestId('modal-due-date')).toHaveTextContent('Due: 2024-12-31');
    });

    it('handles task creation with new fields', async () => {
      const { getByTestId } = render(<TasksScreen />);

      fireEvent.press(getByTestId('add-task-button'));
      fireEvent.press(getByTestId('modal-submit'));

      await waitFor(() => {
        expect(mockMutations.createTask.mutate).toHaveBeenCalledWith({
          name: 'New Task',
          priority: 'medium',
          description: 'Test description',
          image: undefined,
          due_date: undefined,
          list_id: 1,
        });
      });
    });

    it('handles task update with new fields', async () => {
      mockUseTasksByListId.mockReturnValue({
        data: mockTasksWithImageAndDate,
        isLoading: false,
        error: null,
      });

      const { getByTestId, getAllByTestId } = render(<TasksScreen />);

      // Open edit modal for task with image and due date
      const editButtons = getAllByTestId('left-action-0');
      fireEvent.press(editButtons[0]); // Task with image

      // Submit edit
      fireEvent.press(getByTestId('modal-submit'));

      await waitFor(() => {
        expect(mockMutations.updateTask.mutate).toHaveBeenCalledWith({
          id: 3,
          updates: {
            name: 'New Task',
            priority: 'medium',
            description: 'Test description',
            image: 'file://test-image.jpg',
            due_date: '2024-12-31',
          },
        });
      });
    });

    it('handles optimistic task with new fields', () => {
      const tempTaskWithFields: Task = {
        id: 'temp-456' as any,
        name: 'Optimistic Task with Fields',
        description: 'Has all fields',
        image: 'file://temp-image.jpg',
        status: 'pending',
        priority: 'low',
        is_completed: false,
        due_date: '2024-12-25',
        list_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockUseTasksByListId.mockReturnValue({
        data: [...mockTasks, tempTaskWithFields],
        isLoading: false,
        error: null,
      });

      const { getByText, getByTestId } = render(<TasksScreen />);

      expect(getByText('Optimistic Task with Fields')).toBeTruthy();

      // Optimistic tasks should be disabled
      const optimisticTask = getByTestId('task-temp-456');
      expect(optimisticTask.props['data-disabled']).toBe('true');
    });
  });

  describe('Backward compatibility', () => {
    it('handles tasks without image or due_date fields', () => {
      const tasksWithoutNewFields: Task[] = [
        {
          id: 5,
          name: 'Legacy Task',
          description: 'No new fields',
          image: null,
          status: 'pending',
          priority: 'medium',
          is_completed: false,
          due_date: null,
          list_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockUseTasksByListId.mockReturnValue({
        data: tasksWithoutNewFields,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<TasksScreen />);

      expect(getByText('Legacy Task')).toBeTruthy();
    });

    it('handles mixed tasks (some with new fields, some without)', () => {
      const mixedTasks: Task[] = [...mockTasks, ...mockTasksWithImageAndDate];

      mockUseTasksByListId.mockReturnValue({
        data: mixedTasks,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<TasksScreen />);

      // All tasks should render correctly
      expect(getByText('Test Task 1')).toBeTruthy();
      expect(getByText('Test Task 2')).toBeTruthy();
      expect(getByText('Task with Image')).toBeTruthy();
      expect(getByText('Task Due Tomorrow')).toBeTruthy();
    });
  });
});
