'use client';

import React, { useState } from 'react';
import { generateTasksFromFeature, convertAITasksToRegularTasks, analyzeTaskDependencies } from '@/lib/ai-task-generator';
import { AIGeneratedTask, Task } from '@/models/Task';
import axios from 'axios';

export default function GenerateTasksPage() {
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<AIGeneratedTask[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featureTitle || !featureDescription) {
      setError('Please provide both a title and description for the feature.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const tasks = await generateTasksFromFeature({
        title: featureTitle,
        description: featureDescription,
      });
      
      setGeneratedTasks(tasks);
    } catch (err) {
      console.error('Error generating tasks:', err);
      setError('Failed to generate tasks. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTasks = async () => {
    if (generatedTasks.length === 0) return;
    
    try {
      // Convert AI tasks to regular tasks
      const regularTasks = convertAITasksToRegularTasks(generatedTasks);
      
      // Analyze dependencies and add due dates
      const tasksWithDueDates = analyzeTaskDependencies(regularTasks);
      
      // Save tasks to API
      const savePromises = tasksWithDueDates.map(task => axios.post('/api/tasks', task));
      await Promise.all(savePromises);
      
      setSuccessMessage('All tasks have been saved successfully!');
      setGeneratedTasks([]);
      setFeatureTitle('');
      setFeatureDescription('');
    } catch (err) {
      console.error('Error saving tasks:', err);
      setError('Failed to save tasks. Please try again.');
    }
  };

  const handleDiscard = () => {
    setGeneratedTasks([]);
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-gray-800">Generate Tasks from Feature</h1>
          <p className="text-gray-600">Describe your feature and let AI generate structured tasks with dependencies</p>
        </div>
      </header>

      <main className="container mx-auto py-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Feature Description</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="featureTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Feature Title
                  </label>
                  <input
                    type="text"
                    id="featureTitle"
                    value={featureTitle}
                    onChange={(e) => setFeatureTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., User Authentication"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Feature Description
                  </label>
                  <textarea
                    id="featureDescription"
                    value={featureDescription}
                    onChange={(e) => setFeatureDescription(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe the feature in detail. Include requirements, constraints, and expected behavior."
                  ></textarea>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                    {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                    {successMessage}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {isGenerating ? 'Generating...' : 'Generate Tasks'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">Generated Tasks</h2>
                
                {generatedTasks.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDiscard}
                      className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveTasks}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Save All Tasks
                    </button>
                  </div>
                )}
              </div>
              
              {isGenerating ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : generatedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                  </svg>
                  <p>No tasks generated yet. Enter a feature description and click "Generate Tasks".</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedTasks.map((task, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2 mb-3">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <div>Estimated: {task.estimatedHours} hours</div>
                        <div>Confidence: {Math.round(task.confidence * 100)}%</div>
                      </div>
                      
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Dependencies:</p>
                          <div className="flex flex-wrap gap-1">
                            {task.dependencies.map((dep) => (
                              <span key={dep} className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 