import { useForm } from '@tanstack/react-form';
import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { ImagePicker } from '@/components/ui/image-picker';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { fieldError, fieldHasError } from '@/lib/utils/field-error';
import { Task } from '@/types';

export type Priority = 'low' | 'medium' | 'high';

const taskSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(100, 'Task name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  image: z.string(),
  due_date: z.string(),
});

interface TaskFormProps {
  onSubmit: (taskData: {
    name: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    image?: string;
    due_date?: string;
  }) => void;
  mode: 'create' | 'edit';
  task?: Task;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, mode, task, isLoading = false }: TaskFormProps) {
  const defaultValues = useMemo(() => {
    return {
      name: task?.name || '',
      description: task?.description || '',
      priority: (task?.priority || 'medium') as Priority,
      image: task?.image || '',
      due_date: task?.due_date || '',
    };
  }, [task]);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        description: value.description.trim() || undefined,
        priority: value.priority,
        image: value.image || undefined,
        due_date: value.due_date || undefined,
      });
    },
    validators: {
      onChange: taskSchema,
    },
  });

  const handleImageChange = (imageUri?: string) => {
    form.setFieldValue('image', imageUri ?? '');
  };

  const handleDateChange = (dateString?: string) => {
    form.setFieldValue('due_date', dateString ?? '');
  };

  return (
    <View className="flex-1">
      <form.Field name="name">
        {(field) => (
          <Input
            label="Task Name"
            required
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Enter task name"
            autoFocus={mode === 'create'}
            hasError={fieldHasError(field)}
            error={fieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <Input
            label="Description"
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Enter task description (optional)"
            multiline
            hasError={fieldHasError(field)}
            error={fieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="priority">
        {(field) => (
          <Select
            label="Priority"
            value={field.state.value}
            options={['low', 'medium', 'high'] as const}
            onValueChange={field.handleChange}
            hasError={fieldHasError(field)}
            error={fieldError(field)}
          />
        )}
      </form.Field>

      {/* Image Picker */}
      <form.Field name="image">
        {(field) => (
          <ImagePicker
            label="Image"
            value={field.state.value}
            onImageChange={handleImageChange}
            hasError={fieldHasError(field)}
            error={fieldError(field)}
            testID="task-image-picker"
          />
        )}
      </form.Field>

      {/* Due Date Picker */}
      <form.Field name="due_date">
        {(field) => (
          <DatePicker
            label="Due Date"
            value={field.state.value}
            onDateChange={handleDateChange}
            placeholder="Select due date (optional)"
            minimumDate={new Date()}
            hasError={fieldHasError(field)}
            error={fieldError(field)}
            testID="task-date-picker"
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            className={canSubmit ? 'bg-green-500' : 'bg-gray-300'}
            onPress={form.handleSubmit}
            disabled={!canSubmit || isSubmitting || isLoading}>
            <Text className="text-center text-lg font-semibold text-white">
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Text>
          </Button>
        )}
      </form.Subscribe>
    </View>
  );
}
