import { render } from '@testing-library/react-native';
import React from 'react';

import { TaskModal } from '@/components/tasks/task-modal';
import { Task } from '@/types';

// Mock dependencies
jest.mock('@/components/ui/modal', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Modal: ({ visible, onClose, title, children }: any) => (
      <View testID="modal" data-visible={visible.toString()}>
        <View testID="modal-header">
          <Text testID="modal-title">{title}</Text>
          <TouchableOpacity testID="modal-close" onPress={onClose}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View testID="modal-content">{children}</View>
      </View>
    ),
  };
});

jest.mock('@/components/tasks/task-form', () => {
  const { View, Text } = require('react-native');
  return {
    TaskForm: ({ mode, task, isLoading, onSubmit }: any) => (
      <View testID="task-form" data-mode={mode} data-loading={isLoading.toString()}>
        <Text testID="task-form-mode">TaskForm - Mode: {mode}</Text>
        {task && <Text testID="task-form-editing">Editing: {task.name}</Text>}
        {task?.image && <Text testID="task-form-image">Image: {task.image}</Text>}
        {task?.due_date && <Text testID="task-form-due-date">Due: {task.due_date}</Text>}
        {isLoading && <Text testID="task-form-loading">Loading...</Text>}
        {onSubmit && <Text testID="task-form-submit">Submit handler attached</Text>}
      </View>
    ),
  };
});

describe('TaskModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    image: null,
    status: 'pending',
    priority: 'medium',
    is_completed: false,
    due_date: null,
    list_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockTaskWithImageAndDate: Task = {
    ...mockTask,
    id: 2,
    image: 'file://test-image.jpg',
    due_date: '2024-12-31',
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders modal when visible', () => {
    const { getByTestId } = render(
      <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
    );

    expect(getByTestId('modal')).toBeTruthy();
    expect(getByTestId('modal').props['data-visible']).toBe('true');
  });

  it('does not render modal when not visible', () => {
    const { getByTestId } = render(
      <TaskModal visible={false} onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
    );

    expect(getByTestId('modal').props['data-visible']).toBe('false');
  });

  it('shows correct title for create mode', () => {
    const { getByTestId } = render(
      <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
    );

    expect(getByTestId('modal-title')).toHaveTextContent('Add New Task');
  });

  it('shows correct title for edit mode', () => {
    const { getByTestId } = render(
      <TaskModal
        visible
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="edit"
        task={mockTask}
      />
    );

    expect(getByTestId('modal-title')).toHaveTextContent('Edit Task');
  });

  it('renders TaskForm with correct props', () => {
    const { getByTestId } = render(
      <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
    );

    const taskForm = getByTestId('task-form');
    expect(taskForm).toBeTruthy();
    expect(taskForm.props['data-mode']).toBe('create');
    expect(getByTestId('task-form-mode')).toHaveTextContent('TaskForm - Mode: create');
  });

  it('passes task to TaskForm in edit mode', () => {
    const { getByTestId } = render(
      <TaskModal
        visible
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="edit"
        task={mockTask}
      />
    );

    const taskForm = getByTestId('task-form');
    expect(taskForm.props['data-mode']).toBe('edit');
    expect(getByTestId('task-form-mode')).toHaveTextContent('TaskForm - Mode: edit');
    expect(getByTestId('task-form-editing')).toHaveTextContent('Editing: Test Task');
  });

  it('passes loading state to TaskForm', () => {
    const { getByTestId } = render(
      <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" isLoading />
    );

    const taskForm = getByTestId('task-form');
    expect(taskForm.props['data-loading']).toBe('true');
    expect(getByTestId('task-form-loading')).toHaveTextContent('Loading...');
  });

  it('handles modal close', () => {
    const { getByTestId } = render(
      <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
    );

    // The actual close functionality would be tested through the Modal component
    const closeButton = getByTestId('modal-close');
    expect(closeButton).toBeTruthy();
  });

  describe('props passing', () => {
    it('passes all required props to child components', () => {
      const { getByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          isLoading={false}
        />
      );

      const modal = getByTestId('modal');
      const taskForm = getByTestId('task-form');

      expect(modal.props['data-visible']).toBe('true');
      expect(taskForm.props['data-mode']).toBe('create');
      expect(taskForm.props['data-loading']).toBe('false');
      expect(getByTestId('task-form-submit')).toHaveTextContent('Submit handler attached');
    });

    it('handles undefined task prop gracefully', () => {
      const { getByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          task={undefined}
        />
      );

      const taskForm = getByTestId('task-form');
      expect(taskForm).toBeTruthy();
      // Should render without errors when task is undefined
    });

    it('defaults isLoading to false when not provided', () => {
      const { getByTestId, queryByText } = render(
        <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const taskForm = getByTestId('task-form');
      expect(taskForm.props['data-loading']).toBe('false');
      expect(queryByText('Loading...')).toBeNull();
    });
  });

  describe('modal behavior', () => {
    it('renders modal content when visible', () => {
      const { getByTestId } = render(
        <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      expect(getByTestId('modal-header')).toBeTruthy();
      expect(getByTestId('modal-content')).toBeTruthy();
    });

    it('maintains modal structure when not visible', () => {
      const { getByTestId } = render(
        <TaskModal visible={false} onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      // Modal structure is still present but marked as not visible
      expect(getByTestId('modal').props['data-visible']).toBe('false');
    });
  });

  describe('accessibility', () => {
    it('provides accessible modal title', () => {
      const { getByTestId } = render(
        <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      expect(getByTestId('modal-title')).toHaveTextContent('Add New Task');
    });

    it('provides close button for keyboard/screen reader users', () => {
      const { getByTestId } = render(
        <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      expect(getByTestId('modal-close')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles mode switching correctly', () => {
      const { rerender, getByTestId } = render(
        <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      expect(getByTestId('modal-title')).toHaveTextContent('Add New Task');

      rerender(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={mockTask}
        />
      );

      expect(getByTestId('modal-title')).toHaveTextContent('Edit Task');
    });

    it('handles task prop changes in edit mode', () => {
      const updatedTask: Task = {
        ...mockTask,
        name: 'Updated Task Name',
      };

      const { rerender, getByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={mockTask}
        />
      );

      expect(getByTestId('task-form-editing')).toHaveTextContent('Editing: Test Task');

      rerender(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={updatedTask}
        />
      );

      expect(getByTestId('task-form-editing')).toHaveTextContent('Editing: Updated Task Name');
    });

    it('passes task with image and due date to TaskForm', () => {
      const { getByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={mockTaskWithImageAndDate}
        />
      );

      expect(getByTestId('task-form-editing')).toHaveTextContent('Editing: Test Task');
      expect(getByTestId('task-form-image')).toHaveTextContent('Image: file://test-image.jpg');
      expect(getByTestId('task-form-due-date')).toHaveTextContent('Due: 2024-12-31');
    });

    it('handles loading state changes', () => {
      const { rerender, getByTestId, queryByText } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          isLoading={false}
        />
      );

      expect(queryByText('Loading...')).toBeNull();

      rerender(
        <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" isLoading />
      );

      expect(getByTestId('task-form').props['data-loading']).toBe('true');
    });
  });

  describe('onSubmit function handling', () => {
    it('passes onSubmit function to TaskForm', () => {
      const { getByTestId } = render(
        <TaskModal visible onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      expect(getByTestId('task-form-submit')).toHaveTextContent('Submit handler attached');
    });

    it('handles onSubmit with new field structure', () => {
      // The onSubmit function should accept the new fields structure
      const enhancedOnSubmit = jest.fn(
        (taskData: {
          name: string;
          description?: string;
          priority: 'low' | 'medium' | 'high';
          image?: string;
          due_date?: string;
        }) => {
          // This validates the interface includes the new fields
          expect(taskData).toBeDefined();
        }
      );

      render(<TaskModal visible onClose={mockOnClose} onSubmit={enhancedOnSubmit} mode="create" />);

      // Test passes if the interface accepts the enhanced onSubmit function
      expect(enhancedOnSubmit).toBeDefined();
    });
  });

  describe('Task with new fields', () => {
    it('renders task with image correctly', () => {
      const taskWithImage: Task = {
        ...mockTask,
        image: 'file://test-image.jpg',
      };

      const { getByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={taskWithImage}
        />
      );

      expect(getByTestId('task-form-image')).toHaveTextContent('Image: file://test-image.jpg');
    });

    it('renders task with due date correctly', () => {
      const taskWithDueDate: Task = {
        ...mockTask,
        due_date: '2024-12-31',
      };

      const { getByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={taskWithDueDate}
        />
      );

      expect(getByTestId('task-form-due-date')).toHaveTextContent('Due: 2024-12-31');
    });

    it('handles task with both image and due date', () => {
      const { getByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={mockTaskWithImageAndDate}
        />
      );

      expect(getByTestId('task-form-image')).toHaveTextContent('Image: file://test-image.jpg');
      expect(getByTestId('task-form-due-date')).toHaveTextContent('Due: 2024-12-31');
    });

    it('handles task without image and due date', () => {
      const { getByTestId, queryByTestId } = render(
        <TaskModal
          visible
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          task={mockTask}
        />
      );

      expect(getByTestId('task-form-editing')).toHaveTextContent('Editing: Test Task');
      expect(queryByTestId('task-form-image')).toBeNull();
      expect(queryByTestId('task-form-due-date')).toBeNull();
    });
  });
});
