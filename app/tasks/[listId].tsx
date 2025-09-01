import Feather from '@expo/vector-icons/Feather';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { FilterControls } from '@/components/tasks/filter-controls';
import { FiltersPanel } from '@/components/tasks/filters-panel';
import { SortPanel } from '@/components/tasks/sort-panel';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskCardSkeleton } from '@/components/tasks/task-card-skeleton';
import { TaskModal } from '@/components/tasks/task-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SwipeableListItem } from '@/components/ui/swipeable-item';
import { useTaskFilters } from '@/lib/hooks/useTaskFilters';
import { filterTasks } from '@/lib/utils/task-filters';
import { sortTasks } from '@/lib/utils/task-sorting';
import { useListById } from '@/queries/hooks/lists';
import {
  useTasksByListId,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTask,
} from '@/queries/hooks/tasks';
import { isTempId } from '@/queries/utils';
import { Task } from '@/types';

export default function TasksScreen() {
  const { listId: listIdStr } = useLocalSearchParams<{ listId: string }>();
  const queryClient = useQueryClient();
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filters = useTaskFilters();

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => {
      if (!prev) setShowSort(false); // Close sort when opening filters
      return !prev;
    });
  }, []);

  const handleToggleSort = useCallback(() => {
    setShowSort((prev) => {
      if (!prev) setShowFilters(false); // Close filters when opening sort
      return !prev;
    });
  }, []);

  const listId = parseInt(listIdStr || '0', 10);

  const { data: list } = useListById(listId);
  const {
    data: listTasks,
    isLoading: listTasksLoading,
    error: listTasksError,
  } = useTasksByListId(listId);

  const tasks = useMemo(() => {
    const filteredTasks = filterTasks(listTasks || [], {
      searchTerm: filters.searchTerm,
      priorityFilter: filters.priorityFilter,
      statusFilter: filters.statusFilter,
    });
    return sortTasks(filteredTasks, filters.sortBy, filters.sortOrder);
  }, [
    listTasks,
    filters.searchTerm,
    filters.priorityFilter,
    filters.statusFilter,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const tasksLoading = listTasksLoading;
  const tasksError = listTasksError;

  const handleTaskModalClose = useCallback(() => {
    setIsTaskModalVisible(false);
    setEditingTask(undefined);
    setModalMode('create');
  }, []);

  const createTaskMutation = useCreateTask(listId, handleTaskModalClose);
  const updateTaskMutation = useUpdateTask(listId);
  const deleteTaskMutation = useDeleteTask(listId);
  const toggleTaskMutation = useToggleTask(listId);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ['tasks', listId] });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, listId]);

  const handleTaskSubmit = useCallback(
    (taskData: {
      name: string;
      description?: string;
      priority: 'low' | 'medium' | 'high';
      image?: string;
      due_date?: string;
    }) => {
      if (modalMode === 'create') {
        createTaskMutation.mutate({
          ...taskData,
          list_id: listId,
        });
      } else if (editingTask) {
        updateTaskMutation.mutate({
          id: editingTask.id,
          updates: taskData,
        });
      }
      handleTaskModalClose();
    },
    [modalMode, editingTask, listId, createTaskMutation, updateTaskMutation, handleTaskModalClose]
  );

  const handleToggleTask = useCallback(
    (task: Task) => {
      toggleTaskMutation.mutate({
        id: task.id,
        isCompleted: !task.is_completed,
      });
    },
    [toggleTaskMutation]
  );

  const handleDeleteTask = useCallback(
    (task: Task) => {
      Alert.alert('Delete Task', `Are you sure you want to delete "${task.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTaskMutation.mutate(task.id),
        },
      ]);
    },
    [deleteTaskMutation]
  );

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setModalMode('edit');
    setIsTaskModalVisible(true);
  }, []);

  const handleCreateTask = useCallback(() => {
    setModalMode('create');
    setIsTaskModalVisible(true);
  }, []);

  const renderItem = useCallback(
    (props: { item: Task }) => {
      const item = props.item;

      // Check if this is an optimistic item
      const isOptimistic = isTempId(item.id);

      // Show optimistic updates via UI state
      const isDeleting = deleteTaskMutation.isPending && deleteTaskMutation.variables === item.id;

      if (isDeleting) {
        return (
          <View className={styles.deletingContainer}>
            <Text className={styles.deletingText}>Deleting...</Text>
          </View>
        );
      }

      const rightActions = isOptimistic
        ? []
        : [
            {
              text: 'Delete',
              textClassName: 'text-white',
              buttonClassName: 'bg-red-500',
              icon: <Feather name="trash" size={24} color="white" />,
              onPress: () => handleDeleteTask(item),
            },
          ];

      const leftActions = isOptimistic
        ? []
        : [
            {
              text: 'Edit',
              textClassName: 'text-white',
              buttonClassName: 'bg-blue-500',
              icon: <Feather name="edit-2" size={24} color="white" />,
              onPress: () => handleEditTask(item),
            },
          ];

      return (
        <SwipeableListItem rightActions={rightActions} leftActions={leftActions}>
          <TaskCard task={item} onToggle={handleToggleTask} disabled={isOptimistic} />
        </SwipeableListItem>
      );
    },
    [
      handleEditTask,
      handleToggleTask,
      handleDeleteTask,
      deleteTaskMutation.isPending,
      deleteTaskMutation.variables,
    ]
  );

  if (tasksError) {
    return (
      <View className={styles.errorContainer}>
        <Stack.Screen options={{ title: list?.name || 'Tasks' }} />
        <Text className={styles.errorText}>Error loading tasks: {tasksError.message}</Text>
        <TouchableOpacity
          className={styles.retryButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ['tasks', listId] })}>
          <Text className={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <Stack.Screen
        options={{
          title: list?.name || 'Tasks',
          headerRight: () => (
            <Button
              variant="header"
              onPress={handleCreateTask}
              disabled={createTaskMutation.isPending}
              className={createTaskMutation.isPending ? 'bg-blue-400' : undefined}>
              {createTaskMutation.isPending ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text className="font-semibold text-white">+ Add</Text>
              )}
            </Button>
          ),
        }}
      />

      <View className={styles.content}>
        <Input
          left={<Feather name="search" size={20} />}
          showClearButton
          value={filters.searchTerm}
          onChangeText={filters.setSearchTerm}
          placeholder="Search tasks..."
          className="mb-3"
          variant="small"
          testID="tasks-search"
        />

        <FilterControls
          showFilters={showFilters}
          showSort={showSort}
          onToggleFilters={handleToggleFilters}
          onToggleSort={handleToggleSort}
        />
        <FiltersPanel showFilters={showFilters} />
        <SortPanel showSort={showSort} />

        {tasksLoading ? (
          <FlatList
            data={Array.from({ length: 5 })}
            renderItem={() => <TaskCardSkeleton />}
            keyExtractor={(_, index) => `skeleton-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerClassName={styles.listContent}
          />
        ) : (
          <FlatList
            data={tasks}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerClassName={styles.listContent}
            ListEmptyComponent={
              <View className={styles.emptyContainer}>
                <Text className={styles.emptyTitle}>
                  {filters.searchTerm.length > 0 || filters.hasActiveFilters
                    ? 'No tasks found'
                    : 'No tasks yet'}
                </Text>
                <Text className={styles.emptyDescription}>
                  {filters.searchTerm.length > 0 || filters.hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'Add your first task to get started!'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <TaskModal
        visible={isTaskModalVisible}
        onClose={handleTaskModalClose}
        onSubmit={handleTaskSubmit}
        mode={modalMode}
        task={editingTask}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />
    </View>
  );
}

const styles = {
  container: 'flex-1 bg-gray-50',
  content: 'flex-1 p-4',
  errorContainer: 'flex-1 items-center justify-center bg-gray-50 p-4',
  errorText: 'mb-4 text-center text-red-600',
  retryButton: 'rounded-lg bg-blue-500 px-4 py-2',
  retryButtonText: 'font-semibold text-white',
  loadingContainer: 'flex-1 items-center justify-center',
  loadingText: 'mt-2 text-gray-600',
  deletingContainer: 'mb-3 rounded-lg border border-gray-200 bg-gray-100 p-4 opacity-50',
  deletingText: 'text-lg font-semibold text-gray-500',
  listContent: 'gap-2',
  emptyContainer: 'flex-1 items-center justify-center py-12',
  emptyTitle: 'mb-2 text-lg text-gray-500',
  emptyDescription: 'text-center text-gray-400',
};
