import { filterLists } from '@/lib/utils/list-filters';
import { List } from '@/types';

const mockLists: List[] = [
  {
    id: 1,
    name: 'Grocery Shopping',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_completed: false,
  },
  {
    id: 2,
    name: 'Work Tasks',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    is_completed: false,
  },
  {
    id: 3,
    name: 'Personal Projects',
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z',
    is_completed: true,
  },
  {
    id: 4,
    name: 'Home Improvement',
    created_at: '2023-01-04T00:00:00Z',
    updated_at: '2023-01-04T00:00:00Z',
    is_completed: false,
  },
];

describe('filterLists', () => {
  it('should return all lists when search term is empty', () => {
    const result = filterLists(mockLists, '');
    expect(result).toEqual(mockLists);
  });

  it('should return all lists when search term is just whitespace', () => {
    const result = filterLists(mockLists, '   ');
    expect(result).toEqual(mockLists);
  });

  it('should filter lists by name (case insensitive)', () => {
    const result = filterLists(mockLists, 'work');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Work Tasks');
  });

  it('should filter lists by partial name match', () => {
    const result = filterLists(mockLists, 'pro');
    expect(result).toHaveLength(2);
    expect(result.map((list) => list.name)).toEqual(['Personal Projects', 'Home Improvement']);
  });

  it('should handle uppercase search terms', () => {
    const result = filterLists(mockLists, 'GROCERY');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Grocery Shopping');
  });

  it('should handle mixed case search terms', () => {
    const result = filterLists(mockLists, 'PeRsOnAl');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Personal Projects');
  });

  it('should return empty array when search term matches nothing', () => {
    const result = filterLists(mockLists, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should filter lists by substring in the middle of name', () => {
    const result = filterLists(mockLists, 'ask');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Work Tasks');
  });

  it('should handle special characters in search term', () => {
    const listsWithSpecialChars = [
      { ...mockLists[0], name: 'Shopping & Errands' },
      { ...mockLists[1], name: 'Work Tasks' },
    ];
    const result = filterLists(listsWithSpecialChars, '&');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Shopping & Errands');
  });

  it('should handle numbers in search term', () => {
    const listsWithNumbers = [
      { ...mockLists[0], name: 'Q1 2023 Goals' },
      { ...mockLists[1], name: 'Work Tasks' },
    ];
    const result = filterLists(listsWithNumbers, '2023');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Q1 2023 Goals');
  });

  it('should handle empty lists array', () => {
    const result = filterLists([], 'search');
    expect(result).toEqual([]);
  });

  it('should not mutate original array', () => {
    const originalLists = [...mockLists];
    const result = filterLists(mockLists, 'work');
    expect(mockLists).toEqual(originalLists);
    expect(result).not.toBe(mockLists);
  });

  it('should handle single character search terms', () => {
    const result = filterLists(mockLists, 'w');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Work Tasks');
  });

  it('should handle very long search terms', () => {
    const longSearchTerm = 'this is a very long search term that probably does not match anything';
    const result = filterLists(mockLists, longSearchTerm);
    expect(result).toHaveLength(0);
  });

  it('should match complete names', () => {
    const result = filterLists(mockLists, 'Work Tasks');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Work Tasks');
  });

  it('should handle multiple matches correctly', () => {
    const listsWithSimilarNames = [
      { ...mockLists[0], name: 'Project Alpha' },
      { ...mockLists[1], name: 'Project Beta' },
      { ...mockLists[2], name: 'Work Tasks' },
    ];
    const result = filterLists(listsWithSimilarNames, 'project');
    expect(result).toHaveLength(2);
    expect(result.map((list) => list.name)).toEqual(['Project Alpha', 'Project Beta']);
  });
});
