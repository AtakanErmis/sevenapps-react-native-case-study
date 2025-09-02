import { render, fireEvent, waitFor } from '@testing-library/react-native';

import TaskScreen from '@/app/(modal)/task';
import { Task } from '@/types';

// Mock expo-router
const mockBack = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: any) => {
      const { View, Text } = require('react-native');
      return (
        <View
          testID="stack-screen"
          data-title={options?.title}
          data-presentation={options?.presentation}>
          <Text>{options?.title}</Text>
        </View>
      );
    },
  },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock @tanstack/react-query
const mockQueryClient = {
  getQueryData: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

// Mock task hooks
const mockCreateTask = {
  mutate: jest.fn(),
  isPending: false,
};

const mockUpdateTask = {
  mutate: jest.fn(),
  isPending: false,
};

const mockUseCreateTask = jest.fn();
const mockUseUpdateTask = jest.fn();

jest.mock('@/queries/hooks/tasks', () => ({
  useCreateTask: (listId: number, onSuccess?: () => void) => mockUseCreateTask(listId, onSuccess),
  useUpdateTask: (listId: number) => mockUseUpdateTask(listId),
}));

// Mock TaskForm component
jest.mock('@/components/tasks/task-form', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    TaskForm: ({ mode, task, isLoading, onSubmit }: any) => (
      <View testID="task-form" data-mode={mode} data-loading={isLoading.toString()}>
        <Text testID="form-mode">Mode: {mode}</Text>
        {task && <Text testID="form-task-name">Task: {task.name}</Text>}
        {task?.image && <Text testID="form-task-image">Image: {task.image}</Text>}
        {task?.due_date && <Text testID="form-task-due-date">Due: {task.due_date}</Text>}
        {isLoading && <Text testID="form-loading">Loading...</Text>}
        <TouchableOpacity
          testID="form-submit"
          onPress={() =>
            onSubmit({
              name: 'Test Task',
              description: 'Test Description',
              priority: 'medium',
              image: task?.image || undefined,
              due_date: task?.due_date || undefined,
            })
          }>
          <Text>Submit</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

describe('TaskScreen', () => {
  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    image: null,
    status: 'pending',
    priority: 'medium',
    is_completed: false,
    due_date: null,
    list_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockTaskWithFields: Task = {
    ...mockTask,
    id: 2,
    image: 'file://test-image.jpg',
    due_date: '2024-12-31',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateTask.mockReturnValue(mockCreateTask);
    mockUseUpdateTask.mockReturnValue(mockUpdateTask);
    mockQueryClient.getQueryData.mockReturnValue([mockTask, mockTaskWithFields]);
  });

  describe('Create mode', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'create',
      });
    });

    it('renders in create mode correctly', () => {
      const { getByTestId } = render(<TaskScreen />);

      expect(getByTestId('stack-screen').props['data-title']).toBe('Add New Task');
      expect(getByTestId('stack-screen').props['data-presentation']).toBe('modal');
      expect(getByTestId('form-mode')).toHaveTextContent('Mode: create');
    });

    it('configures modal presentation options', () => {
      const { getByTestId } = render(<TaskScreen />);

      const stackScreen = getByTestId('stack-screen');
      expect(stackScreen.props['data-presentation']).toBe('modal');
      expect(stackScreen.props['data-title']).toBe('Add New Task');
    });

    it('handles task creation', async () => {
      const { getByTestId } = render(<TaskScreen />);

      fireEvent.press(getByTestId('form-submit'));

      await waitFor(() => {
        expect(mockCreateTask.mutate).toHaveBeenCalledWith({
          name: 'Test Task',
          description: 'Test Description',
          priority: 'medium',
          image: undefined,
          due_date: undefined,
          list_id: 1,
        });
      });
    });

    it('shows loading state during creation', () => {
      mockCreateTask.isPending = true;
      mockUseCreateTask.mockReturnValue(mockCreateTask);

      const { getByTestId } = render(<TaskScreen />);

      const taskForm = getByTestId('task-form');
      expect(taskForm.props['data-loading']).toBe('true');
      expect(getByTestId('form-loading')).toHaveTextContent('Loading...');
    });
  });

  describe('Edit mode', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'edit',
        taskId: '1',
      });
    });

    it('renders in edit mode correctly', () => {
      const { getByTestId } = render(<TaskScreen />);

      expect(getByTestId('stack-screen').props['data-title']).toBe('Edit Task');
      expect(getByTestId('form-mode')).toHaveTextContent('Mode: edit');
      expect(getByTestId('form-task-name')).toHaveTextContent('Task: Test Task');
    });

    it('loads task data from query cache', () => {
      const { getByTestId } = render(<TaskScreen />);

      expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(['tasks', 1]);
      expect(getByTestId('form-task-name')).toHaveTextContent('Task: Test Task');
    });

    it('handles task update', async () => {
      const { getByTestId } = render(<TaskScreen />);

      fireEvent.press(getByTestId('form-submit'));

      await waitFor(() => {
        expect(mockUpdateTask.mutate).toHaveBeenCalledWith({
          id: 1,
          updates: {
            name: 'Test Task',
            description: 'Test Description',
            priority: 'medium',
            image: undefined,
            due_date: undefined,
          },
        });
      });

      expect(mockBack).toHaveBeenCalled();
    });

    it('shows loading state during update', () => {
      mockUpdateTask.isPending = true;
      mockUseUpdateTask.mockReturnValue(mockUpdateTask);

      const { getByTestId } = render(<TaskScreen />);

      const taskForm = getByTestId('task-form');
      expect(taskForm.props['data-loading']).toBe('true');
    });

    it('handles task with image and due date', () => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'edit',
        taskId: '2',
      });

      const { getByTestId } = render(<TaskScreen />);

      expect(getByTestId('form-task-image')).toHaveTextContent('Image: file://test-image.jpg');
      expect(getByTestId('form-task-due-date')).toHaveTextContent('Due: 2024-12-31');
    });

    it('handles missing task gracefully', () => {
      mockQueryClient.getQueryData.mockReturnValue([]);
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'edit',
        taskId: '999',
      });

      const { getByTestId, queryByTestId } = render(<TaskScreen />);

      expect(getByTestId('form-mode')).toHaveTextContent('Mode: edit');
      expect(queryByTestId('form-task-name')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('navigates back after successful creation', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'create',
      });

      render(<TaskScreen />);

      // Verify useCreateTask was called with listId and callback
      expect(mockUseCreateTask).toHaveBeenCalledWith(1, expect.any(Function));

      // Get the callback and call it to simulate successful creation
      const createCallback = mockUseCreateTask.mock.calls[0][1];
      if (createCallback) {
        createCallback();
        expect(mockBack).toHaveBeenCalled();
      }
    });

    it('navigates back after successful update', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'edit',
        taskId: '1',
      });

      const { getByTestId } = render(<TaskScreen />);

      fireEvent.press(getByTestId('form-submit'));

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('handles invalid listId parameter', () => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: 'invalid',
        mode: 'create',
      });

      const { getByTestId } = render(<TaskScreen />);

      // Should not crash and should render form
      expect(getByTestId('task-form')).toBeTruthy();
    });

    it('handles missing listId parameter', () => {
      mockUseLocalSearchParams.mockReturnValue({
        mode: 'create',
      });

      const { getByTestId } = render(<TaskScreen />);

      // Should not crash and should render form
      expect(getByTestId('task-form')).toBeTruthy();
    });

    it('handles invalid taskId in edit mode', () => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'edit',
        taskId: 'invalid',
      });

      const { getByTestId } = render(<TaskScreen />);

      // Should render edit mode but without task data
      expect(getByTestId('form-mode')).toHaveTextContent('Mode: edit');
    });
  });

  describe('UI structure', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'create',
      });
      // Reset loading states
      mockCreateTask.isPending = false;
      mockUpdateTask.isPending = false;
      mockUseCreateTask.mockReturnValue(mockCreateTask);
      mockUseUpdateTask.mockReturnValue(mockUpdateTask);
    });

    it('renders with proper layout structure', () => {
      const { getByTestId } = render(<TaskScreen />);

      expect(getByTestId('stack-screen')).toBeTruthy();
      expect(getByTestId('task-form')).toBeTruthy();
    });

    it('passes correct props to TaskForm', () => {
      const { getByTestId } = render(<TaskScreen />);

      const taskForm = getByTestId('task-form');
      expect(taskForm.props['data-mode']).toBe('create');
      expect(taskForm.props['data-loading']).toBe('false');
    });
  });

  describe('Query cache integration', () => {
    it('queries correct cache key for tasks', () => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '2',
        mode: 'edit',
        taskId: '1',
      });

      render(<TaskScreen />);

      expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(['tasks', 2]);
    });

    it('handles empty query cache', () => {
      mockQueryClient.getQueryData.mockReturnValue(undefined);
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'edit',
        taskId: '1',
      });

      const { getByTestId, queryByTestId } = render(<TaskScreen />);

      expect(getByTestId('form-mode')).toHaveTextContent('Mode: edit');
      expect(queryByTestId('form-task-name')).toBeNull();
    });
  });

  describe('Modal presentation configuration', () => {
    it('configures screen as modal with correct options', () => {
      mockUseLocalSearchParams.mockReturnValue({
        listId: '1',
        mode: 'create',
      });

      const { getByTestId } = render(<TaskScreen />);

      const stackScreen = getByTestId('stack-screen');
      expect(stackScreen.props['data-presentation']).toBe('modal');
    });
  });
});
