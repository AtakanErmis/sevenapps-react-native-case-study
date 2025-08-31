import * as listHooks from '@/queries/hooks/lists';

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

// Mock the database before importing hooks
jest.mock('@/db', () => ({
  db: {},
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({})),
}));

// Mock list queries
const mockGetAllLists = jest.fn();
const mockCreateList = jest.fn();
const mockDeleteList = jest.fn();
const mockUpdateList = jest.fn();
const mockGetListById = jest.fn();
const mockGetAllTasks = jest.fn();

jest.mock('@/queries/lists', () => ({
  getAllLists: mockGetAllLists,
  createList: mockCreateList,
  deleteList: mockDeleteList,
  updateList: mockUpdateList,
  getListById: mockGetListById,
}));

jest.mock('@/queries/tasks', () => ({
  getAllTasks: mockGetAllTasks,
}));

describe('List Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null });
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
    });
  });

  describe('useAllLists', () => {
    it('calls useQuery with correct parameters', () => {
      listHooks.useAllLists();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['lists'],
        })
      );
    });
  });

  describe('useListById', () => {
    it('calls useQuery with correct parameters when listId is provided', () => {
      const listId = 123;
      listHooks.useListById(listId);

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['lists', listId],
        queryFn: expect.any(Function),
        enabled: true,
      });
    });

    it('disables query when listId is falsy', () => {
      listHooks.useListById(0);

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['lists', 0],
        queryFn: expect.any(Function),
        enabled: false,
      });
    });
  });

  describe('useAllTasks', () => {
    it('calls useQuery with correct parameters', () => {
      listHooks.useAllTasks();

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['tasks'],
        })
      );
    });
  });

  describe('useCreateList', () => {
    let mutationOptions: any;

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
      listHooks.useCreateList();

      expect(mockUseMutation).toHaveBeenCalled();
    });

    describe('onMutate', () => {
      it('performs optimistic update', async () => {
        listHooks.useCreateList();

        const mockOldLists = [{ id: 1, name: 'Existing List' }];
        mockQueryClient.getQueryData.mockReturnValue(mockOldLists);

        const result = await mutationOptions.onMutate('New List');

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['lists'] });
        expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(['lists']);
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['lists'], expect.any(Function));
        expect(result).toEqual({ previousLists: mockOldLists });
      });

      it('handles empty previous lists', async () => {
        listHooks.useCreateList();

        mockQueryClient.getQueryData.mockReturnValue(undefined);

        await mutationOptions.onMutate('New List');

        expect(mockQueryClient.setQueryData).toHaveBeenCalled();
        const setQueryDataCall = mockQueryClient.setQueryData.mock.calls[0];
        const updaterFunction = setQueryDataCall[1];
        const result = updaterFunction(undefined);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          name: 'New List',
          is_completed: false,
        });
      });
    });

    describe('onError', () => {
      it('rolls back optimistic update and shows alert', () => {
        listHooks.useCreateList();

        const context = { previousLists: [{ id: 1, name: 'Old List' }] };
        const error = new Error('Create failed');

        mutationOptions.onError(error, 'New List', context);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['lists'], context.previousLists);
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create list');
      });
    });

    describe('onSettled', () => {
      it('invalidates lists query', () => {
        listHooks.useCreateList();

        mutationOptions.onSettled();

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['lists'] });
      });
    });
  });

  describe('useDeleteList', () => {
    let mutationOptions: any;

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
      listHooks.useDeleteList();

      expect(mockUseMutation).toHaveBeenCalled();
    });

    describe('onMutate', () => {
      it('performs optimistic update for both lists and tasks', async () => {
        listHooks.useDeleteList();

        const mockLists = [
          { id: 1, name: 'List 1' },
          { id: 2, name: 'List 2' },
        ];
        const mockTasks = [
          { id: 1, list_id: 1, name: 'Task 1' },
          { id: 2, list_id: 2, name: 'Task 2' },
        ];

        mockQueryClient.getQueryData.mockReturnValueOnce(mockLists).mockReturnValueOnce(mockTasks);

        const result = await mutationOptions.onMutate(1);

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['lists'] });
        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
        expect(result).toEqual({
          previousLists: mockLists,
          previousTasks: mockTasks,
        });
      });
    });

    describe('onError', () => {
      it('rolls back both lists and tasks and shows alert', () => {
        listHooks.useDeleteList();

        const context = {
          previousLists: [{ id: 1, name: 'List 1' }],
          previousTasks: [{ id: 1, list_id: 1, name: 'Task 1' }],
        };

        mutationOptions.onError(new Error('Delete failed'), 1, context);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['lists'], context.previousLists);
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['tasks'], context.previousTasks);
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete list');
      });
    });

    describe('onSettled', () => {
      it('invalidates both lists and tasks queries', () => {
        listHooks.useDeleteList();

        mutationOptions.onSettled();

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['lists'] });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tasks'] });
      });
    });
  });

  describe('useRenameList', () => {
    let mutationOptions: any;

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
      listHooks.useRenameList();

      expect(mockUseMutation).toHaveBeenCalled();
      expect(mutationOptions.mutationFn).toBeInstanceOf(Function);
    });

    describe('onMutate', () => {
      it('performs optimistic update with new name', async () => {
        listHooks.useRenameList();

        const mockLists = [
          { id: 1, name: 'Old Name', updated_at: '2023-01-01' },
          { id: 2, name: 'Other List', updated_at: '2023-01-01' },
        ];

        mockQueryClient.getQueryData.mockReturnValue(mockLists);

        const result = await mutationOptions.onMutate({ id: 1, name: 'New Name' });

        expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['lists'] });
        expect(result).toEqual({ previousLists: mockLists });

        const setQueryDataCall = mockQueryClient.setQueryData.mock.calls[0];
        const updaterFunction = setQueryDataCall[1];
        const updatedLists = updaterFunction(mockLists);

        expect(updatedLists[0]).toMatchObject({
          id: 1,
          name: 'New Name',
        });
        expect(updatedLists[0].updated_at).not.toBe('2023-01-01');
      });
    });

    describe('onError', () => {
      it('rolls back optimistic update and shows alert', () => {
        listHooks.useRenameList();

        const context = { previousLists: [{ id: 1, name: 'Old Name' }] };

        mutationOptions.onError(new Error('Rename failed'), { id: 1, name: 'New Name' }, context);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['lists'], context.previousLists);
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to rename list');
      });
    });

    describe('onSettled', () => {
      it('invalidates lists query', () => {
        listHooks.useRenameList();

        mutationOptions.onSettled();

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['lists'] });
      });
    });
  });
});
