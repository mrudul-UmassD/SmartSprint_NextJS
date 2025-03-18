'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KanbanBoard from '@/components/KanbanBoard';

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

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tasks');
        setTasks(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const response = await axios.put('/api/tasks', updatedTask);
      setTasks(tasks.map(task => (task.id === updatedTask.id ? response.data : task)));
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Project Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              New Task
            </button>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
              JS
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Project Progress</h2>
          <div className="h-2 bg-gray-200 rounded-full mb-2">
            <div className="h-2 bg-indigo-600 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>45% complete</span>
            <span>Due in 15 days</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 h-[calc(100vh-280px)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800">Kanban Board</h2>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="">All Assignees</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
          </div>
        )}
      </main>
    </div>
  );
} 