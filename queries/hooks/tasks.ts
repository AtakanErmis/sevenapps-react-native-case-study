import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import {
  getTasksByListId,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} from '@/queries/tasks';

export const useTasksByListId = (listId: number) => {
  return useQuery({
    queryKey: ['tasks', listId],
    queryFn: () => getTasksByListId(listId),
    enabled: !!listId,
  });
};

export const useCreateTask = (listId: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: {
      name: string;
      description?: string;
      priority?: string;
      list_id: number;
    }) => createTask(taskData),
    onMutate: async (taskData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', listId] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous values
      const previousTasksByList = queryClient.getQueryData(['tasks', listId]);
      const previousAllTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update to the new value
      const optimisticTask = {
        id: `temp_${Date.now()}`, // Use string temp ID
        name: taskData.name,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        list_id: taskData.list_id,
        is_completed: false,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: null,
        image: null,
      };

      queryClient.setQueryData(['tasks', listId], (old: any) => {
        return [...(old || []), optimisticTask];
      });

      queryClient.setQueryData(['tasks'], (old: any) => {
        return [...(old || []), optimisticTask];
      });

      return { previousTasksByList, previousAllTasks };
    },
    onError: (_err, _taskData, context) => {
      // Roll back on error
      queryClient.setQueryData(['tasks', listId], context?.previousTasksByList);
      queryClient.setQueryData(['tasks'], context?.previousAllTasks);
      Alert.alert('Error', 'Failed to create task');
    },
    onSuccess: (_data, _variables, _context) => {
      // Since the API returns SQLiteRunResult, we'll let invalidateQueries handle the refresh
      // The optimistic update will be replaced by the real data from the refetch
      onSuccess?.();
    },
    onSettled: () => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = (listId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<{
        name: string;
        description: string;
        image: string;
        status: string;
        priority: string;
        is_completed: boolean;
        due_date: string;
        list_id: number;
      }>;
    }) => updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', listId] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasksByList = queryClient.getQueryData(['tasks', listId]);
      const previousAllTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks', listId], (old: any) => {
        return (
          old?.map((task: any) =>
            task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
          ) || []
        );
      });

      queryClient.setQueryData(['tasks'], (old: any) => {
        return (
          old?.map((task: any) =>
            task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
          ) || []
        );
      });

      return { previousTasksByList, previousAllTasks };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['tasks', listId], context?.previousTasksByList);
      queryClient.setQueryData(['tasks'], context?.previousAllTasks);
      Alert.alert('Error', 'Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = (listId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId: number) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', listId] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasksByList = queryClient.getQueryData(['tasks', listId]);
      const previousAllTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks', listId], (old: any) => {
        return old?.filter((task: any) => task.id !== taskId) || [];
      });

      queryClient.setQueryData(['tasks'], (old: any) => {
        return old?.filter((task: any) => task.id !== taskId) || [];
      });

      return { previousTasksByList, previousAllTasks };
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['tasks', listId], context?.previousTasksByList);
      queryClient.setQueryData(['tasks'], context?.previousAllTasks);
      Alert.alert('Error', 'Failed to delete task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useToggleTask = (listId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: number; isCompleted: boolean }) =>
      toggleTaskCompletion(id, isCompleted),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', listId] });
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasksByList = queryClient.getQueryData(['tasks', listId]);
      const previousAllTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks', listId], (old: any) => {
        return (
          old?.map((task: any) =>
            task.id === id
              ? { ...task, is_completed: isCompleted, updated_at: new Date().toISOString() }
              : task
          ) || []
        );
      });

      queryClient.setQueryData(['tasks'], (old: any) => {
        return (
          old?.map((task: any) =>
            task.id === id
              ? { ...task, is_completed: isCompleted, updated_at: new Date().toISOString() }
              : task
          ) || []
        );
      });

      return { previousTasksByList, previousAllTasks };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['tasks', listId], context?.previousTasksByList);
      queryClient.setQueryData(['tasks'], context?.previousAllTasks);
      Alert.alert('Error', 'Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
