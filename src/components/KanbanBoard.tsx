import React, { useState, useEffect } from 'react';
import Todo from './Todo';

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks = [],
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [columns, setColumns] = useState({
    todo: [] as Task[],
    inProgress: [] as Task[],
    review: [] as Task[],
    done: [] as Task[],
  });

  useEffect(() => {
    // Organize tasks into columns based on status
    const columnMap = tasks.reduce(
      (acc, task) => {
        if (task.status in acc) {
          acc[task.status].push(task);
        }
        return acc;
      },
      {
        todo: [] as Task[],
        inProgress: [] as Task[],
        review: [] as Task[],
        done: [] as Task[],
      }
    );

    setColumns(columnMap);
  }, [tasks]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, column: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    // Find the task in all columns
    let task: Task | undefined;
    Object.values(columns).forEach(columnTasks => {
      const foundTask = columnTasks.find(t => t.id === taskId);
      if (foundTask) task = foundTask;
    });

    if (task && task.status !== column && onTaskUpdate) {
      // Update task status
      const updatedTask = { ...task, status: column as 'todo' | 'inProgress' | 'review' | 'done' };
      onTaskUpdate(updatedTask);
    }
  };

  const columnTitles = {
    todo: 'To Do',
    inProgress: 'In Progress',
    review: 'Review',
    done: 'Done',
  };

  return (
    <div className="flex h-full overflow-x-auto pb-4 px-4 gap-4">
      {Object.entries(columns).map(([columnKey, columnTasks]) => (
        <div key={columnKey} className="flex-shrink-0 w-72">
          <div className="bg-gray-100 rounded-lg shadow p-3 h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">{columnTitles[columnKey as keyof typeof columnTitles]}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            
            <div
              className="flex-grow overflow-y-auto p-1"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnKey)}
            >
              {columnTasks.length === 0 ? (
                <div className="text-center p-4 text-gray-400 text-sm italic">
                  Drag tasks here
                </div>
              ) : (
                columnTasks.map((task) => (
                  <Todo
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    assignee={task.assignee}
                    dueDate={task.dueDate}
                    tags={task.tags}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard; 