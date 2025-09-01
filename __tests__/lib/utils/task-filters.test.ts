import { filterTasks } from '@/lib/utils/task-filters';
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
    due_date: null,
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
    due_date: null,
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
];

describe('filterTasks', () => {
  describe('search term filtering', () => {
    it('should return all tasks when search term is empty', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: null,
        statusFilter: null,
      });
      expect(result).toEqual(mockTasks);
    });

    it('should filter tasks by name (case insensitive)', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: 'code',
        priorityFilter: null,
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Write code');
    });

    it('should filter tasks by description (case insensitive)', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: 'MILK',
        priorityFilter: null,
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Buy groceries');
    });

    it('should filter tasks by partial name match', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: 'ex',
        priorityFilter: null,
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Exercise');
    });

    it('should return empty array when search term matches nothing', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: 'nonexistent',
        priorityFilter: null,
        statusFilter: null,
      });
      expect(result).toHaveLength(0);
    });

    it('should handle tasks without description', () => {
      const tasksWithoutDesc = [
        { ...mockTasks[0], description: null },
      ];
      const result = filterTasks(tasksWithoutDesc, {
        searchTerm: 'buy',
        priorityFilter: null,
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('priority filtering', () => {
    it('should filter tasks by high priority', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: 'high',
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('high');
    });

    it('should filter tasks by medium priority', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: 'medium',
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('medium');
    });

    it('should filter tasks by low priority', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: 'low',
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('low');
    });

    it('should return empty array when priority filter matches nothing', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: 'urgent',
        statusFilter: null,
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('status filtering', () => {
    it('should filter completed tasks', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: null,
        statusFilter: 'completed',
      });
      expect(result).toHaveLength(1);
      expect(result[0].is_completed).toBe(true);
    });

    it('should filter incomplete tasks', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: null,
        statusFilter: 'incomplete',
      });
      expect(result).toHaveLength(2);
      result.forEach(task => expect(task.is_completed).toBe(false));
    });

    it('should filter by specific status', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: '',
        priorityFilter: null,
        statusFilter: 'in_progress',
      });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('in_progress');
    });
  });

  describe('combined filtering', () => {
    it('should apply search term and priority filter together', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: 'Buy',
        priorityFilter: 'high',
        statusFilter: null,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Buy groceries');
      expect(result[0].priority).toBe('high');
    });

    it('should apply all filters together', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: 'code',
        priorityFilter: 'medium',
        statusFilter: 'completed',
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Write code');
      expect(result[0].priority).toBe('medium');
      expect(result[0].is_completed).toBe(true);
    });

    it('should return empty array when combined filters match nothing', () => {
      const result = filterTasks(mockTasks, {
        searchTerm: 'exercise',
        priorityFilter: 'high',
        statusFilter: 'completed',
      });
      expect(result).toHaveLength(0);
    });
  });
});