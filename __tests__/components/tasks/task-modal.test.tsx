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
    TaskForm: ({ mode, task, isLoading }: any) => (
      <View testID="task-form" data-mode={mode} data-loading={isLoading.toString()}>
        <Text testID="task-form-mode">TaskForm - Mode: {mode}</Text>
        {task && <Text testID="task-form-editing">Editing: {task.name}</Text>}
        {isLoading && <Text testID="task-form-loading">Loading...</Text>}
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
    expect(taskForm).toHaveTextContent('TaskForm - Mode: create');
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
});
