// Simple test for list hooks to ensure they can be imported and instantiated
import * as listHooks from '@/queries/hooks/lists';

// Mock React Query at the top level
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    cancelQueries: jest.fn(),
  })),
}));

// Mock the database before importing hooks
jest.mock('@/db', () => ({
  db: {},
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({})),
}));

// Mock list queries
jest.mock('@/queries/lists', () => ({
  getAllLists: jest.fn(),
  createList: jest.fn(),
  deleteList: jest.fn(),
  renameList: jest.fn(),
}));

describe('List Hooks', () => {
  describe('exports', () => {
    it('exports useAllLists', () => {
      expect(listHooks.useAllLists).toBeDefined();
      expect(typeof listHooks.useAllLists).toBe('function');
    });

    it('exports useCreateList', () => {
      expect(listHooks.useCreateList).toBeDefined();
      expect(typeof listHooks.useCreateList).toBe('function');
    });

    it('exports useDeleteList', () => {
      expect(listHooks.useDeleteList).toBeDefined();
      expect(typeof listHooks.useDeleteList).toBe('function');
    });

    it('exports useRenameList', () => {
      expect(listHooks.useRenameList).toBeDefined();
      expect(typeof listHooks.useRenameList).toBe('function');
    });

    it('exports useListById', () => {
      expect(listHooks.useListById).toBeDefined();
      expect(typeof listHooks.useListById).toBe('function');
    });
  });

  describe('hook instantiation', () => {
    const { useQuery, useMutation, useQueryClient } = require('@tanstack/react-query');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('can instantiate useAllLists', () => {
      const hook = listHooks.useAllLists;
      expect(() => hook()).not.toThrow();
      expect(useQuery).toHaveBeenCalled();
    });

    it('can instantiate useCreateList', () => {
      const hook = listHooks.useCreateList;
      expect(() => hook()).not.toThrow();
      expect(useMutation).toHaveBeenCalled();
      expect(useQueryClient).toHaveBeenCalled();
    });

    it('can instantiate useDeleteList', () => {
      const hook = listHooks.useDeleteList;
      expect(() => hook()).not.toThrow();
      expect(useMutation).toHaveBeenCalled();
      expect(useQueryClient).toHaveBeenCalled();
    });

    it('can instantiate useRenameList', () => {
      const hook = listHooks.useRenameList;
      expect(() => hook()).not.toThrow();
      expect(useMutation).toHaveBeenCalled();
      expect(useQueryClient).toHaveBeenCalled();
    });

    it('can instantiate useListById', () => {
      const hook = listHooks.useListById;
      expect(() => hook(1)).not.toThrow();
      expect(useQuery).toHaveBeenCalled();
    });
  });
});
