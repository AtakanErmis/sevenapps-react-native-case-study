import { List } from '@/types';

export function filterLists(lists: List[], searchTerm: string): List[] {
  const trimmedSearchTerm = searchTerm.trim();
  if (trimmedSearchTerm.length === 0) {
    return lists;
  }

  const searchLower = trimmedSearchTerm.toLowerCase();
  return lists.filter((list) => list.name.toLowerCase().includes(searchLower));
}
