import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const TaskList = ({ tasks, onTaskUpdate, featureFlags = {} }) => {
  const [loading, setLoading] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      if (onTaskUpdate) onTaskUpdate(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, { completed: !completed });
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      );
      if (onTaskUpdate) onTaskUpdate(updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority) => {
    return priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium';
  };

  const isCreativeTask = (task) => {
    const creativeKeywords = ['creative', 'design', 'write', 'story', 'art', 'video', 'content', 'blog', 'script', 'marketing', 'brand'];
    const text = (task.title + ' ' + task.description + ' ' + task.category).toLowerCase();
    return creativeKeywords.some(keyword => text.includes(keyword));
  };

  const handleMouseEnter = (task, event) => {
    if (task.analysis) {
      setHoveredTask(task);
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredTask(null);
  };

  const handleMouseMove = (event) => {
    if (hoveredTask) {
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">Add your first task above to get started!</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Tasks ({tasks.length})
      </h2>
      
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white p-4 rounded shadow-md hover:scale-105 transition-all duration-300 cursor-pointer relative ${
              task.completed ? 'opacity-75' : ''
            }`}
            onMouseEnter={(e) => handleMouseEnter(task, e)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {/* Task Header */}
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleComplete(task.id, task.completed)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                  title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.completed && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 012 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className={`text-gray-700 mb-3 ${task.completed ? 'text-gray-500' : ''}`}>
                {task.description}
              </p>
            )}

            {/* Due Date */}
            <p className="text-sm text-gray-500 mb-3">
              📅 {formatDate(task.dueDate)}
            </p>

            {/* Tags Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category */}
              {task.category && (
                <span className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-700">
                  🏷️ {task.category}
                </span>
              )}

              {/* Priority */}
              <span className={`${getPriorityColor(task.priority)} px-2 py-1 rounded text-sm text-white font-medium`}>
                {getPriorityText(task.priority)}
              </span>

              {/* AI Analysis Indicator */}
              {task.analysis && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  🤖 AI
                </span>
              )}

              {/* Reminder Indicator */}
              {task.reminder && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  🔔 Reminder
                </span>
              )}

              {/* Creative Task Badge (Story IP Mode) */}
              {featureFlags.STORY_IP_MODE && isCreativeTask(task) && (
                <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm font-medium">
                  ✨ Creative
                </span>
              )}
            </div>

            {/* Completion Status */}
            {task.completed && (
              <div className="mt-2 text-green-600 text-sm font-medium">
                ✅ Completed
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Analysis Tooltip */}
      {hoveredTask && hoveredTask.analysis && (
        <div
          className="fixed z-50 bg-gray-800 text-white p-3 rounded shadow-lg max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="text-sm">
            <div className="font-semibold mb-1">🤖 AI Analysis:</div>
            <div className="mb-2">{hoveredTask.analysis}</div>
            {hoveredTask.priority && (
              <div>
                <span className="font-semibold">Suggestion:</span> {hoveredTask.priority} priority
                {hoveredTask.reminder && `, ${hoveredTask.reminder}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;