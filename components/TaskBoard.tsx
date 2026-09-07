'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import { clsx } from 'clsx'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
}

const initialTasks: Task[] = [
  { id: '1', title: 'Design new landing page', status: 'todo', priority: 'high', assignee: 'Alice' },
  { id: '2', title: 'Implement user authentication', status: 'in-progress', priority: 'high', assignee: 'Bob' },
  { id: '3', title: 'Write API documentation', status: 'in-progress', priority: 'medium', assignee: 'Charlie' },
  { id: '4', title: 'Set up CI/CD pipeline', status: 'done', priority: 'medium', assignee: 'David' },
  { id: '5', title: 'Update dependencies', status: 'todo', priority: 'low', assignee: 'Eve' },
]

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-700' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'done', title: 'Done', color: 'bg-green-100 dark:bg-green-900' },
]

export default function TaskBoard() {
  const [tasks, setTasks] = useState(initialTasks)

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Task Board
          </h2>
          <button className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.id} className="space-y-4">
              <div className={clsx('px-3 py-2 rounded-lg', column.color)}>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {column.title} ({getTasksByStatus(column.id).length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {getTasksByStatus(column.id).map(task => (
                  <div
                    key={task.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {task.title}
                      </h4>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <div className={clsx('w-2 h-2 rounded-full', getPriorityColor(task.priority))} />
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                        {task.assignee[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}