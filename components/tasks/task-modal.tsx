import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { TaskForm } from './task-form';

import { Modal } from '@/components/ui/modal';
import { Task } from '@/types';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
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

export function TaskModal({
  visible,
  onClose,
  onSubmit,
  mode,
  task,
  isLoading = false,
}: TaskModalProps) {
  const title = mode === 'create' ? 'Add New Task' : 'Edit Task';

  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 128 : 0}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-safe-or-4">
          <TaskForm onSubmit={onSubmit} mode={mode} task={task} isLoading={isLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
