import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne, insert, update, deleteById } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Define Task type
type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: string;
  project_id?: string;
  parent_task_id?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Get task by id if provided
        if (req.query.id) {
          const taskId = req.query.id as string;
          const task = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
          
          if (!task) {
            return res.status(404).json({ message: 'Task not found' });
          }

          // Get task tags
          const tags = await query<{ name: string }[]>(
            `SELECT t.name FROM tags t 
             JOIN task_tags tt ON t.id = tt.tag_id 
             WHERE tt.task_id = ?`,
            [taskId]
          );
          
          const taskWithTags = {
            ...task,
            tags: tags.map(tag => tag.name)
          };
          
          return res.status(200).json(taskWithTags);
        }

        // Get all tasks with optional filters
        let sql = 'SELECT * FROM tasks';
        const sqlParams: any[] = [];
        const conditions: string[] = [];

        // Apply filters if they exist
        if (req.query.status) {
          conditions.push('status = ?');
          sqlParams.push(req.query.status);
        }

        if (req.query.priority) {
          conditions.push('priority = ?');
          sqlParams.push(req.query.priority);
        }

        if (req.query.assignee_id) {
          conditions.push('assignee_id = ?');
          sqlParams.push(req.query.assignee_id);
        }

        if (req.query.project_id) {
          conditions.push('project_id = ?');
          sqlParams.push(req.query.project_id);
        }

        // Add WHERE clause if there are conditions
        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Add order by
        sql += ' ORDER BY created_at DESC';

        const tasks = await query<Task[]>(sql, sqlParams);

        // Get tags for all tasks
        const tasksWithTags = await Promise.all(
          tasks.map(async (task) => {
            const tags = await query<{ name: string }[]>(
              `SELECT t.name FROM tags t 
               JOIN task_tags tt ON t.id = tt.tag_id 
               WHERE tt.task_id = ?`,
              [task.id]
            );
            
            return {
              ...task,
              tags: tags.map(tag => tag.name)
            };
          })
        );

        res.status(200).json(tasksWithTags);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks' });
      }
      break;
    
    case 'POST':
      try {
        const taskData = req.body;
        const tags = taskData.tags || [];
        delete taskData.tags;

        // Format dates if they exist
        if (taskData.due_date && typeof taskData.due_date === 'string') {
          taskData.due_date = new Date(taskData.due_date).toISOString().split('T')[0];
        }

        // Generate an ID if not provided
        if (!taskData.id) {
          taskData.id = uuidv4();
        }

        // Insert task
        await insert('tasks', taskData);

        // Insert tags for the task
        if (tags && tags.length > 0) {
          for (const tagName of tags) {
            // Check if tag exists, create if it doesn't
            let tagId = await queryOne<{ id: string }>(
              'SELECT id FROM tags WHERE name = ?',
              [tagName]
            );

            if (!tagId) {
              // Create new tag
              const newTagId = uuidv4();
              await insert('tags', { id: newTagId, name: tagName });
              tagId = { id: newTagId };
            }

            // Create task_tag relationship
            await query(
              'INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
              [taskData.id, tagId.id]
            );
          }
        }

        // Return the newly created task with tags
        const createdTask = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [taskData.id]);
        res.status(201).json({ ...createdTask, tags });
      } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task' });
      }
      break;
    
    case 'PUT':
      try {
        const taskData = req.body;
        const { id } = taskData;
        const tags = taskData.tags || [];
        
        // Remove tags from data as they'll be handled separately
        delete taskData.tags;

        // Format dates if they exist
        if (taskData.due_date && typeof taskData.due_date === 'string') {
          taskData.due_date = new Date(taskData.due_date).toISOString().split('T')[0];
        }

        // Check if task exists
        const existingTask = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
        
        if (!existingTask) {
          return res.status(404).json({ message: 'Task not found' });
        }
        
        // Update task
        await update('tasks', id, taskData);

        // Handle tags if they're provided
        if (tags) {
          // Remove existing task-tag relationships
          await query('DELETE FROM task_tags WHERE task_id = ?', [id]);
          
          // Add new task-tag relationships
          for (const tagName of tags) {
            // Check if tag exists, create if it doesn't
            let tagId = await queryOne<{ id: string }>(
              'SELECT id FROM tags WHERE name = ?',
              [tagName]
            );

            if (!tagId) {
              // Create new tag
              const newTagId = uuidv4();
              await insert('tags', { id: newTagId, name: tagName });
              tagId = { id: newTagId };
            }

            // Create task_tag relationship
            await query(
              'INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
              [id, tagId.id]
            );
          }
        }

        // Return the updated task with tags
        const updatedTask = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
        res.status(200).json({ ...updatedTask, tags });
      } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task' });
      }
      break;
    
    case 'DELETE':
      try {
        const taskId = req.query.id as string;
        
        // Check if task exists
        const existingTask = await queryOne<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
        
        if (!existingTask) {
          return res.status(404).json({ message: 'Task not found' });
        }
        
        // Delete task (will cascade delete task_tags and dependencies)
        await deleteById('tasks', taskId);
        
        res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task' });
      }
      break;
    
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 