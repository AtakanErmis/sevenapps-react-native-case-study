import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { TaskCard } from '@/components/tasks/task-card';
import { Task } from '@/types';

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

const mockOnToggle = jest.fn();

describe('TaskCard', () => {
  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders task information correctly', () => {
    const { getByText } = render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    expect(getByText('Test Task')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
    expect(getByText('medium')).toBeTruthy();
  });

  it('renders completed task with checkmark', () => {
    const completedTask: Task = {
      ...mockTask,
      is_completed: true,
    };

    const { getByText } = render(<TaskCard task={completedTask} onToggle={mockOnToggle} />);

    expect(getByText('✓')).toBeTruthy();
  });

  it('handles task toggle when clicked', () => {
    const { getByText } = render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    fireEvent.press(getByText('Test Task'));
    expect(mockOnToggle).toHaveBeenCalledWith(mockTask);
  });

  it('displays task date correctly', () => {
    const { getByText } = render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);

    expect(getByText('1/1/2024')).toBeTruthy();
  });

  it('renders without description when not provided', () => {
    const taskWithoutDescription: Task = {
      ...mockTask,
      description: null,
    };

    const { getByText, queryByText } = render(
      <TaskCard task={taskWithoutDescription} onToggle={mockOnToggle} />
    );

    expect(getByText('Test Task')).toBeTruthy();
    expect(queryByText('Test Description')).toBeNull();
  });
});
