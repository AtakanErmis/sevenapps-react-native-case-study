// Simple test for task hooks to ensure they can be imported and instantiated
import * as taskHooks from '@/queries/hooks/tasks';

// Mock React Query at the top level
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    cancelQueries: jest.fn(),
  })),
}));

// Mock task queries
jest.mock('@/queries/tasks', () => ({
  getTasksByListId: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  toggleTaskCompletion: jest.fn(),
}));

describe('Task Hooks', () => {
  describe('exports', () => {
    it('exports useTasksByListId', () => {
      expect(taskHooks.useTasksByListId).toBeDefined();
      expect(typeof taskHooks.useTasksByListId).toBe('function');
    });

    it('exports useCreateTask', () => {
      expect(taskHooks.useCreateTask).toBeDefined();
      expect(typeof taskHooks.useCreateTask).toBe('function');
    });

    it('exports useUpdateTask', () => {
      expect(taskHooks.useUpdateTask).toBeDefined();
      expect(typeof taskHooks.useUpdateTask).toBe('function');
    });

    it('exports useDeleteTask', () => {
      expect(taskHooks.useDeleteTask).toBeDefined();
      expect(typeof taskHooks.useDeleteTask).toBe('function');
    });

    it('exports useToggleTask', () => {
      expect(taskHooks.useToggleTask).toBeDefined();
      expect(typeof taskHooks.useToggleTask).toBe('function');
    });
  });

  describe('hook instantiation', () => {
    const { useQuery, useMutation, useQueryClient } = require('@tanstack/react-query');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('can instantiate useTasksByListId', () => {
      const hook = taskHooks.useTasksByListId;
      expect(() => hook(1)).not.toThrow();
      expect(useQuery).toHaveBeenCalled();
    });

    it('can instantiate useCreateTask', () => {
      const hook = taskHooks.useCreateTask;
      expect(() => hook(1)).not.toThrow();
      expect(useMutation).toHaveBeenCalled();
      expect(useQueryClient).toHaveBeenCalled();
    });

    it('can instantiate useUpdateTask', () => {
      const hook = taskHooks.useUpdateTask;
      expect(() => hook(1)).not.toThrow();
      expect(useMutation).toHaveBeenCalled();
      expect(useQueryClient).toHaveBeenCalled();
    });

    it('can instantiate useDeleteTask', () => {
      const hook = taskHooks.useDeleteTask;
      expect(() => hook(1)).not.toThrow();
      expect(useMutation).toHaveBeenCalled();
      expect(useQueryClient).toHaveBeenCalled();
    });

    it('can instantiate useToggleTask', () => {
      const hook = taskHooks.useToggleTask;
      expect(() => hook(1)).not.toThrow();
      expect(useMutation).toHaveBeenCalled();
      expect(useQueryClient).toHaveBeenCalled();
    });
  });
});
