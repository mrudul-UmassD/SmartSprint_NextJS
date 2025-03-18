export type TaskStatus = 'todo' | 'inProgress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  projectId?: string;
  parentTaskId?: string; // For subtasks
  dependencies?: string[]; // IDs of tasks that this task depends on
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  tags?: string[];
  dueDate?: Date;
  search?: string;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTask: number;
  completionRate: number; // Percentage
  averageCompletionTime: number; // In days
  tasksByAssignee: Record<string, number>;
  tasksByPriority: Record<TaskPriority, number>;
  taskCompletionTrend: Array<{
    date: Date;
    completed: number;
  }>;
}

export interface AIGeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours: number;
  tags: string[];
  dependencies?: string[];
  confidence: number; // AI confidence score (0-1)
}

// Factory function to create a new task
export function createTask(
  title: string,
  description: string,
  status: TaskStatus = 'todo',
  priority: TaskPriority = 'medium',
  options: Partial<Task> = {}
): Task {
  return {
    id: options.id || Date.now().toString(),
    title,
    description,
    status,
    priority,
    createdAt: options.createdAt || new Date(),
    updatedAt: options.updatedAt || new Date(),
    ...options,
  };
} 