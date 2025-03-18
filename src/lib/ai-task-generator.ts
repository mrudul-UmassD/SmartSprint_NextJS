import { AIGeneratedTask, Task, createTask } from '@/models/Task';

// This is a mock implementation
// In a real application, you would integrate with an actual AI/NLP service
// such as OpenAI's GPT or a custom trained model

export interface FeatureDescription {
  title: string;
  description: string;
  projectId?: string;
}

export async function generateTasksFromFeature(
  featureDescription: FeatureDescription
): Promise<AIGeneratedTask[]> {
  // In a real implementation, this would call an AI service
  // For demo purposes, we'll return some mock data
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock generated tasks based on feature description
  const mockTasks: AIGeneratedTask[] = [
    {
      title: `Implement ${featureDescription.title} backend API`,
      description: `Create REST API endpoints for ${featureDescription.title} functionality. Ensure proper error handling and validation.`,
      priority: 'high',
      estimatedHours: 8,
      tags: ['backend', 'api'],
      confidence: 0.92,
    },
    {
      title: `Create ${featureDescription.title} database schema`,
      description: `Design and implement database schema to support ${featureDescription.title} functionality. Include proper indexes and constraints.`,
      priority: 'high',
      estimatedHours: 4,
      tags: ['database', 'schema'],
      dependencies: ['backend-api'],
      confidence: 0.89,
    },
    {
      title: `Develop ${featureDescription.title} UI components`,
      description: `Create React components for the ${featureDescription.title} user interface. Ensure responsive design and accessibility.`,
      priority: 'medium',
      estimatedHours: 6,
      tags: ['frontend', 'ui'],
      confidence: 0.85,
    },
    {
      title: `Implement ${featureDescription.title} integration tests`,
      description: `Write comprehensive integration tests for ${featureDescription.title} functionality to ensure it works as expected across different parts of the system.`,
      priority: 'medium',
      estimatedHours: 5,
      tags: ['testing', 'integration'],
      dependencies: ['backend-api', 'ui-components'],
      confidence: 0.78,
    },
    {
      title: `Create ${featureDescription.title} documentation`,
      description: `Document the ${featureDescription.title} functionality, including API endpoints, UI usage, and any configuration options.`,
      priority: 'low',
      estimatedHours: 3,
      tags: ['documentation'],
      dependencies: ['backend-api', 'ui-components'],
      confidence: 0.95,
    },
  ];

  return mockTasks;
}

export function convertAITasksToRegularTasks(
  aiTasks: AIGeneratedTask[],
  projectId?: string
): Task[] {
  return aiTasks.map((aiTask, index) => {
    return createTask(
      aiTask.title,
      aiTask.description,
      'todo',
      aiTask.priority,
      {
        projectId,
        estimatedHours: aiTask.estimatedHours,
        tags: aiTask.tags,
        dependencies: aiTask.dependencies,
        // Generate unique IDs that can be referenced by dependencies
        id: `task-${Date.now()}-${index}`,
      }
    );
  });
}

// Function to analyze dependencies and suggest timeline
export function analyzeTaskDependencies(tasks: Task[]): Task[] {
  const tasksWithDueDates = [...tasks];
  const today = new Date();
  
  // Create a map of task IDs to their index in the array
  const taskMap = new Map<string, number>();
  tasksWithDueDates.forEach((task, index) => {
    taskMap.set(task.id, index);
  });
  
  // First pass: assign due dates to tasks with no dependencies
  tasksWithDueDates.forEach((task, index) => {
    if (!task.dependencies || task.dependencies.length === 0) {
      // Tasks with no dependencies get a due date based on estimated hours
      // Assuming 6 working hours per day
      const daysNeeded = Math.ceil((task.estimatedHours || 4) / 6);
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + daysNeeded);
      tasksWithDueDates[index] = { ...task, dueDate };
    }
  });
  
  // Second pass: assign due dates to tasks with dependencies
  // This is a simplistic approach; a real implementation would use a topological sort
  let changed = true;
  const MAX_ITERATIONS = 10; // Prevent infinite loops
  let iterations = 0;
  
  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;
    
    tasksWithDueDates.forEach((task, index) => {
      if (task.dependencies && task.dependencies.length > 0 && !task.dueDate) {
        // Check if all dependencies have due dates
        const dependencyDueDates = task.dependencies
          .map(depId => {
            const depIndex = taskMap.get(depId);
            return depIndex !== undefined ? tasksWithDueDates[depIndex].dueDate : undefined;
          })
          .filter(date => date !== undefined) as Date[];
          
        if (dependencyDueDates.length === task.dependencies.length) {
          // All dependencies have due dates, find the latest one
          const latestDependencyDate = new Date(Math.max(...dependencyDueDates.map(d => d.getTime())));
          
          // Add days based on estimated hours
          const daysNeeded = Math.ceil((task.estimatedHours || 4) / 6);
          const dueDate = new Date(latestDependencyDate);
          dueDate.setDate(dueDate.getDate() + daysNeeded);
          
          tasksWithDueDates[index] = { ...task, dueDate };
          changed = true;
        }
      }
    });
  }
  
  return tasksWithDueDates;
} 