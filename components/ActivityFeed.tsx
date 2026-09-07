'use client'

import { Clock, User, GitCommit, MessageSquare, CheckCircle } from 'lucide-react'

interface Activity {
  id: string
  type: 'commit' | 'comment' | 'task' | 'user'
  user: string
  action: string
  target?: string
  timestamp: string
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'commit',
    user: 'Alice',
    action: 'pushed 3 commits to',
    target: 'main branch',
    timestamp: '2 minutes ago'
  },
  {
    id: '2',
    type: 'task',
    user: 'Bob',
    action: 'completed task',
    target: 'User Authentication',
    timestamp: '15 minutes ago'
  },
  {
    id: '3',
    type: 'comment',
    user: 'Charlie',
    action: 'commented on',
    target: 'API Documentation',
    timestamp: '1 hour ago'
  },
  {
    id: '4',
    type: 'user',
    user: 'David',
    action: 'joined the project',
    timestamp: '2 hours ago'
  },
  {
    id: '5',
    type: 'commit',
    user: 'Eve',
    action: 'pushed 1 commit to',
    target: 'feature/dashboard',
    timestamp: '3 hours ago'
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'commit': return GitCommit
    case 'comment': return MessageSquare
    case 'task': return CheckCircle
    case 'user': return User
    default: return Clock
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'commit': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
    case 'comment': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
    case 'task': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900'
    case 'user': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
  }
}

export default function ActivityFeed() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}
                    {activity.target && (
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {' '}{activity.target}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        
        <button className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
          View all activity
        </button>
      </div>
    </div>
  )
}