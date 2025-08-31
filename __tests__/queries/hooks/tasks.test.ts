import * as taskHooks from '@/queries/hooks/tasks';

// Mock React Query at the top level
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
  cancelQueries: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useMutation: (...args: any[]) => mockUseMutation(...args),
  useQueryClient: () => mockQueryClient,
}));

// Mock task queries
const mockGetTasksByListId = jest.fn();
const mockCreateTask = jest.fn();
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();
const mockToggleTaskCompletion = jest.fn();

jest.mock('@/queries/tasks', () => ({
  getTasksByListId: mockGetTasksByListId,
  createTask: mockCreateTask,
  updateTask: mockUpdateTask,
  deleteTask: mockDeleteTask,
  toggleTaskCompletion: mockToggleTaskCompletion,
}));

describe('Task Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null });
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
    });
  });

  describe('useTasksByListId', () => {
    it('calls useQuery with correct parameters when listId is provided', () => {
      const listId = 123;
      taskHooks.useTasksByListId(listId);

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['tasks', listId],
        queryFn: expect.any(Function),
        enabled: true,
      });
    });

    it('disables query when listId is falsy', () => {
      taskHooks.useTasksByListId(0);

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['tasks', 0],
        queryFn: expect.any(Function),
        enabled: false,
      });
    });

    it('calls correct query function', () => {
      const listId = 123;
      taskHooks.useTasksByListId(listId);

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['tasks', listId],
        queryFn: expect.any(Function),
        enabled: true,
      });
    });
  });

  describe('useCreateTask', () => {
    let mutationOptions: any;
    const mockOnSuccess = jest.fn();
    const listId = 1;

    beforeEach(() => {
      mockUseMutation.mockImplementation((options) => {
        mutationOptions = options;
        return {
          mutate: jest.fn(),
          isPending: false,
          error: null,
        };
      });
    });

    it('calls useMutation with createTask as mutationFn', () => {
      taskHooks.useCreateTask(listId);

      expect(mockUseMutation).toHaveBeenCalled();
      expect(mutationOptions.mutationFn).toBeInstanceOf(Function);
    });

    describe('onMutate', () => {
      it('performs optimistic update', async () => {
        taskHooks.useCreateTask(listId);

        const mockTasksByList = [{ id: 1, name: 'Existing Task', list_id: listId }];
        const mockAllTasks = [{ id: 1, name: 'Existing Task', list_id: listId }];

        mockQueryClient.getQueryData
          .mockReturnValueOnce(mockTasksByList)
          .mockReturnValueOnce(mockAllTasks);

        const taskData = {
          name: 'New Task',
          description: 'Task description',
          priority: 'high',
          list_id: listId,
        };

        const result = await mutationOptions.onMutate(taskData);

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks', listId] });
        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
        expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
          previousTasksByList: mockTasksByList,
          previousAllTasks: mockAllTasks,
        });
      });

      it('handles empty previous tasks', async () => {
        taskHooks.useCreateTask(listId);

        mockQueryClient.getQueryData.mockReturnValue(undefined);

        const taskData = {
          name: 'New Task',
          list_id: listId,
        };

        await mutationOptions.onMutate(taskData);

        const setQueryDataCalls = mockQueryClient.setQueryData.mock.calls;
        expect(setQueryDataCalls).toHaveLength(2);

        // Test the updater functions with undefined old data
        const tasksByListUpdater = setQueryDataCalls[0][1];
        const allTasksUpdater = setQueryDataCalls[1][1];

        const tasksByListResult = tasksByListUpdater(undefined);
        const allTasksResult = allTasksUpdater(undefined);

        expect(tasksByListResult).toHaveLength(1);
        expect(allTasksResult).toHaveLength(1);
        expect(tasksByListResult[0]).toMatchObject({
          name: 'New Task',
          priority: 'medium',
          is_completed: false,
          status: 'pending',
          list_id: listId,
        });
      });

      it('creates optimistic task with default values', async () => {
        taskHooks.useCreateTask(listId);

        mockQueryClient.getQueryData.mockReturnValue([]);

        const taskData = {
          name: 'New Task',
          list_id: listId,
        };

        await mutationOptions.onMutate(taskData);

        const setQueryDataCall = mockQueryClient.setQueryData.mock.calls[0];
        const updaterFunction = setQueryDataCall[1];
        const result = updaterFunction([]);

        expect(result[0]).toMatchObject({
          name: 'New Task',
          description: null,
          priority: 'medium',
          is_completed: false,
          status: 'pending',
          due_date: null,
          image: null,
        });
        expect(result[0].id).toMatch(/^temp_\d+$/);
        expect(result[0].created_at).toBeDefined();
        expect(result[0].updated_at).toBeDefined();
      });
    });

    describe('onError', () => {
      it('rolls back optimistic update and shows alert', () => {
        taskHooks.useCreateTask(listId);

        const context = {
          previousTasksByList: [{ id: 1, name: 'Old Task' }],
          previousAllTasks: [{ id: 1, name: 'Old Task' }],
        };

        mutationOptions.onError(new Error('Create failed'), {}, context);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks', listId],
          context.previousTasksByList
        );
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks'],
          context.previousAllTasks
        );
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create task');
      });
    });

    describe('onSuccess', () => {
      it('calls onSuccess callback when provided', () => {
        taskHooks.useCreateTask(listId, mockOnSuccess);

        mutationOptions.onSuccess({}, {}, {});

        expect(mockOnSuccess).toHaveBeenCalled();
      });

      it('does not throw when onSuccess callback is not provided', () => {
        taskHooks.useCreateTask(listId);

        expect(() => mutationOptions.onSuccess({}, {}, {})).not.toThrow();
      });
    });

    describe('onSettled', () => {
      it('invalidates both task queries', () => {
        taskHooks.useCreateTask(listId);

        mutationOptions.onSettled();

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['tasks', listId],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
      });
    });
  });

  describe('useUpdateTask', () => {
    let mutationOptions: any;
    const listId = 1;

    beforeEach(() => {
      mockUseMutation.mockImplementation((options) => {
        mutationOptions = options;
        return {
          mutate: jest.fn(),
          isPending: false,
          error: null,
        };
      });
    });

    it('calls useMutation with updateTask as mutationFn', () => {
      taskHooks.useUpdateTask(listId);

      expect(mockUseMutation).toHaveBeenCalled();
      expect(mutationOptions.mutationFn).toBeInstanceOf(Function);
    });

    it('mutation function is defined', () => {
      taskHooks.useUpdateTask(listId);

      expect(mutationOptions.mutationFn).toBeInstanceOf(Function);
    });

    describe('onMutate', () => {
      it('performs optimistic update on both queries', async () => {
        taskHooks.useUpdateTask(listId);

        const mockTasksByList = [
          { id: 1, name: 'Task 1', priority: 'low' },
          { id: 2, name: 'Task 2', priority: 'medium' },
        ];
        const mockAllTasks = [
          { id: 1, name: 'Task 1', priority: 'low' },
          { id: 2, name: 'Task 2', priority: 'medium' },
        ];

        mockQueryClient.getQueryData
          .mockReturnValueOnce(mockTasksByList)
          .mockReturnValueOnce(mockAllTasks);

        const updateData = {
          id: 1,
          updates: { name: 'Updated Task', priority: 'high' },
        };

        const result = await mutationOptions.onMutate(updateData);

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks', listId] });
        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
        expect(result).toEqual({
          previousTasksByList: mockTasksByList,
          previousAllTasks: mockAllTasks,
        });

        // Verify optimistic updates
        const setQueryDataCalls = mockQueryClient.setQueryData.mock.calls;
        const tasksByListUpdater = setQueryDataCalls[0][1];
        const allTasksUpdater = setQueryDataCalls[1][1];

        const updatedTasksByList = tasksByListUpdater(mockTasksByList);
        const updatedAllTasks = allTasksUpdater(mockAllTasks);

        expect(updatedTasksByList[0]).toMatchObject({
          id: 1,
          name: 'Updated Task',
          priority: 'high',
        });
        expect(updatedTasksByList[0].updated_at).toBeDefined();
        expect(updatedAllTasks[0]).toMatchObject({
          id: 1,
          name: 'Updated Task',
          priority: 'high',
        });
      });

      it('handles empty previous tasks', async () => {
        taskHooks.useUpdateTask(listId);

        mockQueryClient.getQueryData.mockReturnValue(undefined);

        const updateData = { id: 1, updates: { name: 'Updated' } };

        await mutationOptions.onMutate(updateData);

        const setQueryDataCalls = mockQueryClient.setQueryData.mock.calls;
        const updater = setQueryDataCalls[0][1];
        const result = updater(undefined);

        expect(result).toEqual([]);
      });
    });

    describe('onError', () => {
      it('rolls back optimistic update and shows alert', () => {
        taskHooks.useUpdateTask(listId);

        const context = {
          previousTasksByList: [{ id: 1, name: 'Original Task' }],
          previousAllTasks: [{ id: 1, name: 'Original Task' }],
        };

        mutationOptions.onError(new Error('Update failed'), {}, context);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks', listId],
          context.previousTasksByList
        );
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks'],
          context.previousAllTasks
        );
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update task');
      });
    });

    describe('onSettled', () => {
      it('invalidates both task queries', () => {
        taskHooks.useUpdateTask(listId);

        mutationOptions.onSettled();

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['tasks', listId],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
      });
    });
  });

  describe('useDeleteTask', () => {
    let mutationOptions: any;
    const listId = 1;

    beforeEach(() => {
      mockUseMutation.mockImplementation((options) => {
        mutationOptions = options;
        return {
          mutate: jest.fn(),
          isPending: false,
          error: null,
        };
      });
    });

    it('calls useMutation', () => {
      taskHooks.useDeleteTask(listId);

      expect(mockUseMutation).toHaveBeenCalled();
    });

    describe('onMutate', () => {
      it('performs optimistic deletion on both queries', async () => {
        taskHooks.useDeleteTask(listId);

        const mockTasksByList = [
          { id: 1, name: 'Task 1' },
          { id: 2, name: 'Task 2' },
        ];
        const mockAllTasks = [
          { id: 1, name: 'Task 1' },
          { id: 2, name: 'Task 2' },
        ];

        mockQueryClient.getQueryData
          .mockReturnValueOnce(mockTasksByList)
          .mockReturnValueOnce(mockAllTasks);

        const result = await mutationOptions.onMutate(1);

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks', listId] });
        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
        expect(result).toEqual({
          previousTasksByList: mockTasksByList,
          previousAllTasks: mockAllTasks,
        });

        // Verify optimistic deletions
        const setQueryDataCalls = mockQueryClient.setQueryData.mock.calls;
        const tasksByListUpdater = setQueryDataCalls[0][1];
        const allTasksUpdater = setQueryDataCalls[1][1];

        const filteredTasksByList = tasksByListUpdater(mockTasksByList);
        const filteredAllTasks = allTasksUpdater(mockAllTasks);

        expect(filteredTasksByList).toHaveLength(1);
        expect(filteredTasksByList[0].id).toBe(2);
        expect(filteredAllTasks).toHaveLength(1);
        expect(filteredAllTasks[0].id).toBe(2);
      });
    });

    describe('onError', () => {
      it('rolls back optimistic deletion and shows alert', () => {
        taskHooks.useDeleteTask(listId);

        const context = {
          previousTasksByList: [{ id: 1, name: 'Deleted Task' }],
          previousAllTasks: [{ id: 1, name: 'Deleted Task' }],
        };

        mutationOptions.onError(new Error('Delete failed'), 1, context);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks', listId],
          context.previousTasksByList
        );
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks'],
          context.previousAllTasks
        );
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete task');
      });
    });

    describe('onSettled', () => {
      it('invalidates both task queries', () => {
        taskHooks.useDeleteTask(listId);

        mutationOptions.onSettled();

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['tasks', listId],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
      });
    });
  });

  describe('useToggleTask', () => {
    let mutationOptions: any;
    const listId = 1;

    beforeEach(() => {
      mockUseMutation.mockImplementation((options) => {
        mutationOptions = options;
        return {
          mutate: jest.fn(),
          isPending: false,
          error: null,
        };
      });
    });

    it('calls useMutation with correct mutationFn', () => {
      taskHooks.useToggleTask(listId);

      expect(mockUseMutation).toHaveBeenCalled();
      expect(mutationOptions.mutationFn).toBeInstanceOf(Function);
    });

    it('mutation function is defined', () => {
      taskHooks.useToggleTask(listId);

      expect(mutationOptions.mutationFn).toBeInstanceOf(Function);
    });

    describe('onMutate', () => {
      it('performs optimistic toggle on both queries', async () => {
        taskHooks.useToggleTask(listId);

        const mockTasksByList = [
          { id: 1, name: 'Task 1', is_completed: false, updated_at: '2023-01-01' },
          { id: 2, name: 'Task 2', is_completed: false, updated_at: '2023-01-01' },
        ];
        const mockAllTasks = [
          { id: 1, name: 'Task 1', is_completed: false, updated_at: '2023-01-01' },
          { id: 2, name: 'Task 2', is_completed: false, updated_at: '2023-01-01' },
        ];

        mockQueryClient.getQueryData
          .mockReturnValueOnce(mockTasksByList)
          .mockReturnValueOnce(mockAllTasks);

        const toggleData = { id: 1, isCompleted: true };

        const result = await mutationOptions.onMutate(toggleData);

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks', listId] });
        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
        expect(result).toEqual({
          previousTasksByList: mockTasksByList,
          previousAllTasks: mockAllTasks,
        });

        // Verify optimistic toggle
        const setQueryDataCalls = mockQueryClient.setQueryData.mock.calls;
        const tasksByListUpdater = setQueryDataCalls[0][1];
        const allTasksUpdater = setQueryDataCalls[1][1];

        const toggledTasksByList = tasksByListUpdater(mockTasksByList);
        const toggledAllTasks = allTasksUpdater(mockAllTasks);

        expect(toggledTasksByList[0]).toMatchObject({
          id: 1,
          is_completed: true,
        });
        expect(toggledTasksByList[0].updated_at).not.toBe('2023-01-01');
        expect(toggledAllTasks[0]).toMatchObject({
          id: 1,
          is_completed: true,
        });
      });

      it('handles empty previous tasks', async () => {
        taskHooks.useToggleTask(listId);

        mockQueryClient.getQueryData.mockReturnValue(undefined);

        const toggleData = { id: 1, isCompleted: true };

        await mutationOptions.onMutate(toggleData);

        const setQueryDataCalls = mockQueryClient.setQueryData.mock.calls;
        const updater = setQueryDataCalls[0][1];
        const result = updater(undefined);

        expect(result).toEqual([]);
      });
    });

    describe('onError', () => {
      it('rolls back optimistic toggle and shows alert', () => {
        taskHooks.useToggleTask(listId);

        const context = {
          previousTasksByList: [{ id: 1, is_completed: false }],
          previousAllTasks: [{ id: 1, is_completed: false }],
        };

        mutationOptions.onError(new Error('Toggle failed'), {}, context);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks', listId],
          context.previousTasksByList
        );
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          ['tasks'],
          context.previousAllTasks
        );
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update task');
      });
    });

    describe('onSettled', () => {
      it('invalidates both task queries', () => {
        taskHooks.useToggleTask(listId);

        mutationOptions.onSettled();

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['tasks', listId],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
      });
    });
  });
});
