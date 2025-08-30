import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { getAllLists, createList, deleteList, updateList, getListById } from '@/queries/lists';
import { getAllTasks } from '@/queries/tasks';

export const useAllLists = () => {
  return useQuery({
    queryKey: ['lists'],
    queryFn: getAllLists,
  });
};

export const useListById = (listId: number) => {
  return useQuery({
    queryKey: ['lists', listId],
    queryFn: () => getListById(listId),
    enabled: !!listId,
  });
};

export const useAllTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getAllTasks,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createList,
    onMutate: async (name: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['lists'] });

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData(['lists']);

      // Optimistically update to the new value
      queryClient.setQueryData(['lists'], (old: any) => {
        const optimisticList = {
          id: `temp_${Date.now()}`, // Use string temp ID to avoid collisions
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
        };
        return [...(old || []), optimisticList];
      });

      // Return a context object with the snapshotted value
      return { previousLists };
    },
    onError: (_err, _name, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['lists'], context?.previousLists);
      Alert.alert('Error', 'Failed to create list');
    },
    onSuccess: (_data, _variables, _context) => {
      // Since the API returns SQLiteRunResult, we'll let invalidateQueries handle the refresh
      // The optimistic update will be replaced by the real data from the refetch
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteList,
    onMutate: async (listId: number) => {
      await queryClient.cancelQueries({ queryKey: ['lists'] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousLists = queryClient.getQueryData(['lists']);
      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['lists'], (old: any) => {
        return old?.filter((list: any) => list.id !== listId) || [];
      });

      queryClient.setQueryData(['tasks'], (old: any) => {
        return old?.filter((task: any) => task.list_id !== listId) || [];
      });

      return { previousLists, previousTasks };
    },
    onError: (_err, _listId, context) => {
      queryClient.setQueryData(['lists'], context?.previousLists);
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      Alert.alert('Error', 'Failed to delete list');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useRenameList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateList(id, name),
    onMutate: async ({ id, name }: { id: number; name: string }) => {
      await queryClient.cancelQueries({ queryKey: ['lists'] });

      const previousLists = queryClient.getQueryData(['lists']);

      queryClient.setQueryData(['lists'], (old: any) => {
        return (
          old?.map((list: any) =>
            list.id === id ? { ...list, name, updated_at: new Date().toISOString() } : list
          ) || []
        );
      });

      return { previousLists };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['lists'], context?.previousLists);
      Alert.alert('Error', 'Failed to rename list');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
};
