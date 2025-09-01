import { Task } from '@/types';

export interface FilterOptions {
  searchTerm: string;
  priorityFilter: string | null;
  statusFilter: string | null;
}

export function filterTasks(
  baseTasks: Task[],
  { searchTerm, priorityFilter, statusFilter }: FilterOptions
): Task[] {
  let filteredTasks = baseTasks;

  // Apply search term filter (client-side)
  if (searchTerm.length > 0) {
    const searchLower = searchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.name.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
    );
  }

  // Apply priority filter
  if (priorityFilter) {
    filteredTasks = filteredTasks.filter((task) => task.priority === priorityFilter);
  }

  // Apply status filter
  if (statusFilter) {
    if (statusFilter === 'completed') {
      filteredTasks = filteredTasks.filter((task) => task.is_completed);
    } else if (statusFilter === 'incomplete') {
      filteredTasks = filteredTasks.filter((task) => !task.is_completed);
    } else {
      filteredTasks = filteredTasks.filter((task) => task.status === statusFilter);
    }
  }

  return filteredTasks;
}
