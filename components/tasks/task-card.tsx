import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { cn } from '@/lib/utils/cn';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  disabled?: boolean;
}

export function TaskCard({ task, onToggle, disabled = false }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;
  const isDueSoon =
    task.due_date &&
    new Date(task.due_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 &&
    !task.is_completed;

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View
      className={cn(
        styles.container,
        disabled ? styles.containerDisabled : styles.containerEnabled,
        task.is_completed && styles.containerCompleted
      )}>
      <TouchableOpacity disabled={disabled} onPress={() => onToggle(task)}>
        <View className={styles.content}>
          <View
            className={cn(
              styles.checkbox,
              task.is_completed ? styles.checkboxCompleted : styles.checkboxUncompleted
            )}>
            {task.is_completed && <Text className={styles.checkmark}>✓</Text>}
          </View>
          <View className={styles.taskInfo}>
            <Text
              className={cn(
                styles.taskName,
                task.is_completed ? styles.taskNameCompleted : styles.taskNameUncompleted
              )}>
              {task.name}
            </Text>
            {task.description && (
              <Text
                className={cn(
                  styles.taskDescription,
                  task.is_completed
                    ? styles.taskDescriptionCompleted
                    : styles.taskDescriptionUncompleted
                )}>
                {task.description}
              </Text>
            )}

            {/* Task Image */}
            {task.image && (
              <View className={styles.imageContainer}>
                <Image
                  source={{ uri: task.image }}
                  className={styles.taskImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View className={styles.taskMeta}>
              <View
                className={cn(styles.priorityBadge, getPriorityColor(task.priority || 'medium'))}>
                <Text className={styles.priorityText}>{task.priority || 'medium'}</Text>
              </View>

              {/* Due Date */}
              {task.due_date && (
                <View
                  className={cn(
                    styles.dueDateBadge,
                    isOverdue
                      ? styles.dueDateOverdue
                      : isDueSoon
                        ? styles.dueDateSoon
                        : styles.dueDateNormal
                  )}>
                  <Feather
                    name="calendar"
                    size={10}
                    color={isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#6b7280'}
                  />
                  <Text
                    className={cn(
                      styles.dueDateText,
                      isOverdue
                        ? styles.dueDateTextOverdue
                        : isDueSoon
                          ? styles.dueDateTextSoon
                          : styles.dueDateTextNormal
                    )}>
                    {formatDueDate(task.due_date)}
                  </Text>
                </View>
              )}

              <Text className={styles.dateText}>
                {new Date(task.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: 'rounded-lg border border-gray-200 p-4',
  containerEnabled: 'bg-white',
  containerDisabled: 'bg-gray-100 opacity-50',
  containerCompleted: 'opacity-60',
  content: 'flex-row items-start',
  checkbox: 'mr-3 mt-1 h-6 w-6 items-center justify-center rounded-full border-2',
  checkboxCompleted: 'border-green-500 bg-green-500',
  checkboxUncompleted: 'border-gray-300',
  checkmark: 'text-xs font-bold text-white',
  taskInfo: 'flex-1',
  taskName: 'text-lg font-medium',
  taskNameCompleted: 'text-gray-500 line-through',
  taskNameUncompleted: 'text-gray-900',
  taskDescription: 'mt-1 text-sm',
  taskDescriptionCompleted: 'text-gray-400',
  taskDescriptionUncompleted: 'text-gray-600',
  imageContainer: 'mt-2',
  taskImage: 'h-24 w-full rounded-lg',
  taskMeta: 'mt-2 flex-row items-center gap-2 flex-wrap',
  priorityBadge: 'rounded-full px-2 py-1',
  priorityText: 'text-xs font-medium capitalize',
  dueDateBadge: 'flex-row items-center gap-1 rounded-full px-2 py-1',
  dueDateNormal: 'bg-gray-100',
  dueDateSoon: 'bg-yellow-100',
  dueDateOverdue: 'bg-red-100',
  dueDateText: 'text-xs font-medium',
  dueDateTextNormal: 'text-gray-600',
  dueDateTextSoon: 'text-yellow-800',
  dueDateTextOverdue: 'text-red-800',
  dateText: 'text-xs text-gray-400',
};
