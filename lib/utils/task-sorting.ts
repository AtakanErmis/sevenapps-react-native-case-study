import { SortBy, SortOrder } from '@/store/task-filters';
import { Task } from '@/types';

export function sortTasks(tasks: Task[], sortBy: SortBy, sortOrder: SortOrder): Task[] {
  return tasks.sort((a, b) => {
    // First, separate by completion status - incomplete tasks always come first
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1; // completed tasks go to the end
    }

    // If both have same completion status, sort by the selected criteria
    let comparison = 0;
    const priorityValues = { high: 3, medium: 2, low: 1 };

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'due_date':
        // Handle null due dates - put them at the end
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;
      case 'priority': {
        // Priority order: high = 3, medium = 2, low = 1
        const aPriority = priorityValues[a.priority as keyof typeof priorityValues] || 0;
        const bPriority = priorityValues[b.priority as keyof typeof priorityValues] || 0;
        comparison = aPriority - bPriority;
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}
