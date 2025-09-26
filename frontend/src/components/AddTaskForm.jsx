import { useState } from 'react'

const AddTaskForm = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    priority: 'medium',
    reminder: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiAdvice, setAiAdvice] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const newTask = await onAddTask(formData)
      setAiAdvice(newTask.analysis)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        category: '',
        priority: 'medium',
        reminder: false
      })
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Task</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field resize-none"
              rows="3"
              placeholder="Describe your task..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select category</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Reminder */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reminder"
              name="reminder"
              checked={formData.reminder}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="reminder" className="ml-2 block text-sm text-gray-700">
              Set reminder
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding Task...' : 'Add Task & Get AI Advice'}
          </button>
        </div>
      </form>

      {/* AI Advice */}
      {aiAdvice && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <h4 className="text-sm font-medium text-primary-900 mb-2">
            🤖 AI Advice:
          </h4>
          <p className="text-sm text-primary-800">{aiAdvice}</p>
        </div>
      )}
    </div>
  )
}

export default AddTaskForm
