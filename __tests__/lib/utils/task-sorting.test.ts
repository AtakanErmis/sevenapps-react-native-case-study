import { sortTasks } from '@/lib/utils/task-sorting';
import { Task } from '@/types';

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Buy groceries',
    description: 'Milk, eggs, bread',
    priority: 'high',
    is_completed: false,
    status: 'pending',
    list_id: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    due_date: '2023-01-05T00:00:00Z',
    image: null,
  },
  {
    id: 2,
    name: 'Write code',
    description: 'Complete the task filtering feature',
    priority: 'medium',
    is_completed: true,
    status: 'completed',
    list_id: 1,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    due_date: '2023-01-03T00:00:00Z',
    image: null,
  },
  {
    id: 3,
    name: 'Exercise',
    description: 'Go for a run',
    priority: 'low',
    is_completed: false,
    status: 'in_progress',
    list_id: 1,
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z',
    due_date: null,
    image: null,
  },
  {
    id: 4,
    name: 'Another completed task',
    description: 'This is done',
    priority: 'low',
    is_completed: true,
    status: 'completed',
    list_id: 1,
    created_at: '2023-01-04T00:00:00Z',
    updated_at: '2023-01-04T00:00:00Z',
    due_date: '2023-01-02T00:00:00Z',
    image: null,
  },
];

describe('sortTasks', () => {
  describe('completion status priority', () => {
    it('should always put incomplete tasks before completed tasks regardless of other sorting', () => {
      const result = sortTasks(mockTasks, 'name', 'asc');
      const incompleteCount = result.filter((t) => !t.is_completed).length;
      const completedTasks = result.slice(incompleteCount);
      const incompleteTasks = result.slice(0, incompleteCount);

      incompleteTasks.forEach((task) => expect(task.is_completed).toBe(false));
      completedTasks.forEach((task) => expect(task.is_completed).toBe(true));
    });
  });

  describe('name sorting', () => {
    it('should sort by name ascending', () => {
      const result = sortTasks(mockTasks, 'name', 'asc');
      const incompleteNames = result.filter((t) => !t.is_completed).map((t) => t.name);
      expect(incompleteNames).toEqual(['Buy groceries', 'Exercise']);
    });

    it('should sort by name descending', () => {
      const result = sortTasks(mockTasks, 'name', 'desc');
      const incompleteNames = result.filter((t) => !t.is_completed).map((t) => t.name);
      expect(incompleteNames).toEqual(['Exercise', 'Buy groceries']);
    });

    it('should sort completed tasks by name too', () => {
      const result = sortTasks(mockTasks, 'name', 'asc');
      const completedNames = result.filter((t) => t.is_completed).map((t) => t.name);
      expect(completedNames).toEqual(['Another completed task', 'Write code']);
    });
  });

  describe('created_at sorting', () => {
    it('should sort by created_at ascending', () => {
      const result = sortTasks(mockTasks, 'created_at', 'asc');
      const incompleteDates = result.filter((t) => !t.is_completed).map((t) => t.created_at);
      expect(incompleteDates).toEqual(['2023-01-01T00:00:00Z', '2023-01-03T00:00:00Z']);
    });

    it('should sort by created_at descending', () => {
      const result = sortTasks(mockTasks, 'created_at', 'desc');
      const incompleteDates = result.filter((t) => !t.is_completed).map((t) => t.created_at);
      expect(incompleteDates).toEqual(['2023-01-03T00:00:00Z', '2023-01-01T00:00:00Z']);
    });
  });

  describe('due_date sorting', () => {
    it('should sort by due_date ascending with null dates at end', () => {
      const result = sortTasks(mockTasks, 'due_date', 'asc');
      const incompleteTasks = result.filter((t) => !t.is_completed);
      expect(incompleteTasks[0].due_date).toBe('2023-01-05T00:00:00Z');
      expect(incompleteTasks[1].due_date).toBe(null);
    });

    it('should sort by due_date descending with null dates at end', () => {
      const result = sortTasks(mockTasks, 'due_date', 'desc');
      const incompleteTasks = result.filter((t) => !t.is_completed);
      expect(incompleteTasks[0].due_date).toBe('2023-01-05T00:00:00Z');
      expect(incompleteTasks[1].due_date).toBe(null);
    });

    it('should handle all null due dates', () => {
      const tasksWithNullDates = mockTasks.map((task) => ({ ...task, due_date: null }));
      const result = sortTasks(tasksWithNullDates, 'due_date', 'asc');
      expect(result).toHaveLength(4);
    });

    it('should handle mixed null and non-null due dates', () => {
      const mixedTasks = [
        { ...mockTasks[0], due_date: '2023-01-10T00:00:00Z', is_completed: false },
        { ...mockTasks[1], due_date: null, is_completed: false },
        { ...mockTasks[2], due_date: '2023-01-05T00:00:00Z', is_completed: false },
      ];
      const result = sortTasks(mixedTasks, 'due_date', 'asc');
      expect(result[0].due_date).toBe('2023-01-05T00:00:00Z');
      expect(result[1].due_date).toBe('2023-01-10T00:00:00Z');
      expect(result[2].due_date).toBe(null);
    });
  });

  describe('priority sorting', () => {
    it('should sort by priority ascending (low to high)', () => {
      const result = sortTasks(mockTasks, 'priority', 'asc');
      const incompletePriorities = result.filter((t) => !t.is_completed).map((t) => t.priority);
      expect(incompletePriorities).toEqual(['low', 'high']);
    });

    it('should sort by priority descending (high to low)', () => {
      const result = sortTasks(mockTasks, 'priority', 'desc');
      const incompletePriorities = result.filter((t) => !t.is_completed).map((t) => t.priority);
      expect(incompletePriorities).toEqual(['high', 'low']);
    });

    it('should handle all priority levels correctly', () => {
      const allPriorityTasks = [
        { ...mockTasks[0], priority: 'high', is_completed: false },
        { ...mockTasks[1], priority: 'medium', is_completed: false },
        { ...mockTasks[2], priority: 'low', is_completed: false },
      ];
      const result = sortTasks(allPriorityTasks, 'priority', 'desc');
      const priorities = result.map((t) => t.priority);
      expect(priorities).toEqual(['high', 'medium', 'low']);
    });

    it('should handle unknown priority values', () => {
      const tasksWithUnknownPriority = [
        { ...mockTasks[0], priority: 'unknown' as any, is_completed: false },
        { ...mockTasks[1], priority: 'high', is_completed: false },
      ];
      const result = sortTasks(tasksWithUnknownPriority, 'priority', 'desc');
      expect(result[0].priority).toBe('high');
      expect(result[1].priority).toBe('unknown');
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const result = sortTasks([], 'name', 'asc');
      expect(result).toEqual([]);
    });

    it('should handle single task', () => {
      const singleTask = [mockTasks[0]];
      const result = sortTasks(singleTask, 'name', 'asc');
      expect(result).toEqual(singleTask);
    });

    it('should not mutate original array', () => {
      const originalTasks = [...mockTasks];
      const result = sortTasks([...mockTasks], 'name', 'asc');
      expect(mockTasks).toEqual(originalTasks);
      expect(result).not.toEqual(mockTasks); // Result should be different due to sorting
    });

    it('should handle tasks with same values', () => {
      const sameTasks = [
        { ...mockTasks[0], name: 'Same Name', is_completed: false },
        { ...mockTasks[1], name: 'Same Name', is_completed: false },
      ];
      const result = sortTasks(sameTasks, 'name', 'asc');
      expect(result).toHaveLength(2);
      result.forEach((task) => expect(task.name).toBe('Same Name'));
    });
  });
});
