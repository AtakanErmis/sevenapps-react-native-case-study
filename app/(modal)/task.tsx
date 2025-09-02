import { useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { TaskForm } from '@/components/tasks/task-form';
import { useCreateTask, useUpdateTask } from '@/queries/hooks/tasks';
import { Task } from '@/types';

export default function TaskScreen() {
  const {
    listId: listIdStr,
    mode,
    taskId,
  } = useLocalSearchParams<{
    listId: string;
    mode: 'create' | 'edit';
    taskId?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const listId = parseInt(listIdStr || '0', 10);
  const taskIdInt = taskId ? parseInt(taskId, 10) : undefined;

  // Get the task data if we're editing
  const task: Task | undefined = taskIdInt
    ? (queryClient.getQueryData(['tasks', listId]) as Task[] | undefined)?.find(
        (t: Task) => t.id === taskIdInt
      )
    : undefined;

  const createTaskMutation = useCreateTask(listId, () => router.back());
  const updateTaskMutation = useUpdateTask(listId);

  const handleSubmit = (taskData: {
    name: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    image?: string;
    due_date?: string;
  }) => {
    if (mode === 'create') {
      createTaskMutation.mutate({
        ...taskData,
        list_id: listId,
      });
    } else if (task) {
      updateTaskMutation.mutate({
        id: task.id,
        updates: taskData,
      });
      router.back();
    }
  };

  const title = mode === 'create' ? 'Add New Task' : 'Edit Task';
  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          title,
          presentation: 'modal',
          headerLeft: () => null,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 128 : 0}
        className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-safe-or-4 p-4">
          <TaskForm onSubmit={handleSubmit} mode={mode} task={task} isLoading={isLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
