import { useState } from 'react'

const TaskList = ({ tasks, onUpdateTask, onDeleteTask }) => {
  const [expandedTask, setExpandedTask] = useState(null)

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  const toggleComplete = (task) => {
    onUpdateTask(task.id, { completed: !task.completed })
  }

  const toggleExpanded = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId)
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    const today = new Date()
    const due = new Date(dueDate)
    return due < today && due.toDateString() !== today.toDateString()
  }

  if (tasks.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">Add your first task above to get started with AI-powered productivity!</p>
      </div>
    )
  }

  const incompleteTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  return (
    <div className="space-y-6">
      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Tasks ({incompleteTasks.length})
          </h3>
          <div className="space-y-4">
            {incompleteTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTask === task.id}
                onToggleComplete={toggleComplete}
                onToggleExpanded={toggleExpanded}
                onDelete={onDeleteTask}
                formatDate={formatDate}
                getPriorityColor={getPriorityColor}
                isOverdue={isOverdue}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-4">
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTask === task.id}
                onToggleComplete={toggleComplete}
                onToggleExpanded={toggleExpanded}
                onDelete={onDeleteTask}
                formatDate={formatDate}
                getPriorityColor={getPriorityColor}
                isOverdue={isOverdue}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const TaskCard = ({ 
  task, 
  isExpanded, 
  onToggleComplete, 
  onToggleExpanded, 
  onDelete,
  formatDate,
  getPriorityColor,
  isOverdue
}) => {
  return (
    <div className={`card transition-all duration-200 ${task.completed ? 'opacity-75' : ''} ${isOverdue(task.dueDate) && !task.completed ? 'border-red-300 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed 
                ? 'bg-primary-600 border-primary-600 text-white' 
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            {task.completed && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h4>
              <span className={getPriorityColor(task.priority)}>
                {task.priority}
              </span>
              {isOverdue(task.dueDate) && !task.completed && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Overdue
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span>📅 {formatDate(task.dueDate)}</span>
              {task.category && (
                <span>🏷️ {task.category}</span>
              )}
              {task.reminder && (
                <span>🔔 Reminder set</span>
              )}
            </div>

            {task.description && (
              <p className={`text-sm mb-2 ${task.completed ? 'text-gray-500' : 'text-gray-700'}`}>
                {task.description}
              </p>
            )}

            {/* AI Analysis */}
            {task.analysis && (
              <button
                onClick={() => onToggleExpanded(task.id)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {isExpanded ? '🤖 Hide AI Advice' : '🤖 Show AI Advice'}
              </button>
            )}

            {/* Expanded AI Advice */}
            {isExpanded && task.analysis && (
              <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-primary-800">{task.analysis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-600 transition-colors ml-2"
          title="Delete task"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 012 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TaskList
