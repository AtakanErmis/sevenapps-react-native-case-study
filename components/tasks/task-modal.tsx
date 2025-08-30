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
      <TaskForm onSubmit={onSubmit} mode={mode} task={task} isLoading={isLoading} />
    </Modal>
  );
}
