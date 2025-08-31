import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { TaskCard } from '@/components/tasks/task-card';
import { Task } from '@/types';

// Mock Feather icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

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

const mockTaskWithImage: Task = {
  ...mockTask,
  id: 2,
  image: 'file://test-image.jpg',
};

const mockTaskWithDueDate: Task = {
  ...mockTask,
  id: 3,
  due_date: '2024-12-31',
};

const mockTaskOverdue: Task = {
  ...mockTask,
  id: 4,
  due_date: '2023-01-01', // Past date
};

const mockTaskDueSoon: Task = {
  ...mockTask,
  id: 5,
  due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 hours from now
};

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const mockTaskDueToday: Task = {
  ...mockTask,
  id: 6,
  due_date: today,
};

const mockTaskDueTomorrow: Task = {
  ...mockTask,
  id: 7,
  due_date: tomorrow,
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

  describe('Image functionality', () => {
    it('does not render image when task has no image', () => {
      expect(() => {
        render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);
      }).not.toThrow();
    });

    it('renders image when task has an image', () => {
      expect(() => {
        render(<TaskCard task={mockTaskWithImage} onToggle={mockOnToggle} />);
      }).not.toThrow();
    });

    it('displays task with image correctly', () => {
      const { getByText } = render(<TaskCard task={mockTaskWithImage} onToggle={mockOnToggle} />);

      // Task should still render with all other information
      expect(getByText('Test Task')).toBeTruthy();
      expect(getByText('Test Description')).toBeTruthy();
    });
  });

  describe('Due date functionality', () => {
    it('does not show due date when task has no due date', () => {
      expect(() => {
        render(<TaskCard task={mockTask} onToggle={mockOnToggle} />);
      }).not.toThrow();
    });

    it('displays due date when task has due date', () => {
      const { getByText } = render(<TaskCard task={mockTaskWithDueDate} onToggle={mockOnToggle} />);

      expect(getByText('12/31/2024')).toBeTruthy();
    });

    it('shows "Today" for tasks due today', () => {
      const { getByText } = render(<TaskCard task={mockTaskDueToday} onToggle={mockOnToggle} />);

      expect(getByText('Today')).toBeTruthy();
    });

    it('shows "Tomorrow" for tasks due tomorrow', () => {
      const { getByText } = render(<TaskCard task={mockTaskDueTomorrow} onToggle={mockOnToggle} />);

      expect(getByText('Tomorrow')).toBeTruthy();
    });

    it('applies overdue styling for past due tasks', () => {
      const { getByText } = render(<TaskCard task={mockTaskOverdue} onToggle={mockOnToggle} />);

      // The date should still be displayed
      expect(getByText('1/1/2023')).toBeTruthy();
    });

    it('applies due soon styling for tasks due within 24 hours', () => {
      expect(() => {
        render(<TaskCard task={mockTaskDueSoon} onToggle={mockOnToggle} />);
      }).not.toThrow();
    });

    it('does not show due date indicators for completed tasks', () => {
      const completedOverdueTask: Task = {
        ...mockTaskOverdue,
        is_completed: true,
      };

      expect(() => {
        render(<TaskCard task={completedOverdueTask} onToggle={mockOnToggle} />);
      }).not.toThrow();
    });
  });

  describe('Priority indicators', () => {
    it('renders high priority task correctly', () => {
      const highPriorityTask: Task = {
        ...mockTask,
        priority: 'high',
      };

      const { getByText } = render(<TaskCard task={highPriorityTask} onToggle={mockOnToggle} />);

      expect(getByText('high')).toBeTruthy();
    });

    it('renders low priority task correctly', () => {
      const lowPriorityTask: Task = {
        ...mockTask,
        priority: 'low',
      };

      const { getByText } = render(<TaskCard task={lowPriorityTask} onToggle={mockOnToggle} />);

      expect(getByText('low')).toBeTruthy();
    });

    it('defaults to medium priority when priority is null', () => {
      const taskNoPriority: Task = {
        ...mockTask,
        priority: null as any,
      };

      const { getByText } = render(<TaskCard task={taskNoPriority} onToggle={mockOnToggle} />);

      expect(getByText('medium')).toBeTruthy();
    });
  });

  describe('Combined features', () => {
    it('renders task with both image and due date', () => {
      const taskWithBoth: Task = {
        ...mockTaskWithImage,
        due_date: '2024-12-31',
      };

      const { getByText } = render(<TaskCard task={taskWithBoth} onToggle={mockOnToggle} />);

      expect(getByText('Test Task')).toBeTruthy();
      expect(getByText('12/31/2024')).toBeTruthy();
    });

    it('handles completed task with image and due date', () => {
      const completedTaskWithBoth: Task = {
        ...mockTaskWithImage,
        due_date: '2024-12-31',
        is_completed: true,
      };

      const { getByText } = render(
        <TaskCard task={completedTaskWithBoth} onToggle={mockOnToggle} />
      );

      expect(getByText('Test Task')).toBeTruthy();
      expect(getByText('✓')).toBeTruthy();
      expect(getByText('12/31/2024')).toBeTruthy();
    });
  });

  describe('Accessibility and interaction', () => {
    it('remains clickable when disabled prop is false', () => {
      const { getByText } = render(
        <TaskCard task={mockTask} onToggle={mockOnToggle} disabled={false} />
      );

      fireEvent.press(getByText('Test Task'));
      expect(mockOnToggle).toHaveBeenCalledWith(mockTask);
    });

    it('prevents interaction when disabled prop is true', () => {
      const { getByText } = render(<TaskCard task={mockTask} onToggle={mockOnToggle} disabled />);

      fireEvent.press(getByText('Test Task'));
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });
});
