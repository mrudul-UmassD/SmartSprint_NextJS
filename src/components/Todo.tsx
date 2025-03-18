import React from 'react';

interface TodoProps {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
  onStatusChange?: (id: string, status: string) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const Todo: React.FC<TodoProps> = ({
  id,
  title,
  description,
  status,
  priority,
  assignee,
  dueDate,
  tags = [],
  onStatusChange,
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white rounded-lg shadow-sm p-4 mb-3 cursor-grab hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[priority]}`}>
          {priority}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {tags.map((tag) => (
          <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        {assignee && (
          <div className="flex items-center">
            <span className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center mr-1 text-indigo-700">
              {assignee.charAt(0).toUpperCase()}
            </span>
            <span>{assignee}</span>
          </div>
        )}
        
        {dueDate && <div>Due: {formatDate(dueDate)}</div>}
      </div>
    </div>
  );
};

export default Todo; 