import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Task } from '@/types';

export type Priority = 'low' | 'medium' | 'high';

const taskSchema = z.object({
  name: z
    .string()
    .min(1, 'Task name is required')
    .max(100, 'Task name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  priority: z.enum(['low', 'medium', 'high']),
});

interface TaskFormProps {
  onSubmit: (taskData: {
    name: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
  }) => void;
  mode: 'create' | 'edit';
  task?: Task;
}

export function TaskForm({ onSubmit, mode, task }: TaskFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      priority: 'medium' as Priority,
    },
    validators: {
      onChange: ({ value }) => {
        const result = taskSchema.safeParse(value);
        if (!result.success) {
          return result.error.format();
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        description: value.description.trim() || undefined,
        priority: value.priority,
      });
    },
  });

  useEffect(() => {
    if (mode === 'edit' && task) {
      form.setFieldValue('name', task.name);
      form.setFieldValue('description', task.description || '');
      form.setFieldValue('priority', (task.priority as Priority) || 'medium');
    } else if (mode === 'create') {
      form.reset();
    }
  }, [mode, task]);

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
            isError={!field.state.meta.isValid && field.state.meta.isTouched}
            error={
              !field.state.meta.isValid && field.state.meta.isTouched
                ? field.state.meta.errors.join(', ')
                : undefined
            }
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
            isError={!field.state.meta.isValid && field.state.meta.isTouched}
            error={
              !field.state.meta.isValid && field.state.meta.isTouched
                ? field.state.meta.errors.join(', ')
                : undefined
            }
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
            isError={!field.state.meta.isValid && field.state.meta.isTouched}
            error={
              !field.state.meta.isValid && field.state.meta.isTouched
                ? field.state.meta.errors.join(', ')
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            className={canSubmit ? 'bg-green-500' : 'bg-gray-300'}
            onPress={form.handleSubmit}
            disabled={!canSubmit || isSubmitting}>
            <Text className="text-center text-lg font-semibold text-white">
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Text>
          </Button>
        )}
      </form.Subscribe>
    </View>
  );
}
