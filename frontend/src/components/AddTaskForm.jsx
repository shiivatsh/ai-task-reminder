import { useState, useEffect } from 'react';
import axios from 'axios';

const AddTaskForm = ({ onAddTask, onTaskDataChange }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    priority: 'medium',
    reminder: false
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto AI advice when description and dueDate are filled
  useEffect(() => {
    const getAiAdvice = async () => {
      if (formData.description.trim() && formData.dueDate) {
        setIsAiLoading(true);
        setError('');
        try {
          const response = await axios.post('/prioritize', {
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
            category: formData.category
          });
          
          setAiAdvice(response.data);
          
          // Auto-apply AI suggestions if category is empty
          if (!formData.category && response.data.suggestion?.suggestedCategory) {
            setFormData(prev => ({
              ...prev,
              category: response.data.suggestion.suggestedCategory,
              priority: response.data.suggestion.priority || prev.priority,
              reminder: response.data.suggestion.reminder || prev.reminder
            }));
          }
        } catch (error) {
          console.error('AI advice error:', error);
          setError('Failed to get AI advice. Please try again.');
        } finally {
          setIsAiLoading(false);
        }
      } else {
        setAiAdvice(null);
      }
    };

    // Debounce the AI call by 1 second
    const timeoutId = setTimeout(getAiAdvice, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.description, formData.dueDate, formData.title, formData.category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);
    setError('');
    
    // Notify parent about task data changes for AI analysis
    if (onTaskDataChange) {
      onTaskDataChange(newFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Use AI-enhanced data if available
      const taskData = {
        ...formData,
        ...(aiAdvice?.suggestion && {
          priority: aiAdvice.suggestion.priority || formData.priority,
          category: aiAdvice.suggestion.suggestedCategory || formData.category,
          reminder: aiAdvice.suggestion.reminder || formData.reminder
        }),
        analysis: aiAdvice?.analysis || ''
      };

      await onAddTask(taskData);
      
      // Show success state
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        category: '',
        priority: 'medium',
        reminder: false
      });
      setAiAdvice(null);
      
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200" style={{ borderWidth: '0.5px' }}>
      <h3 className="text-lg font-medium text-black mb-6" style={{ fontFamily: 'Montserrat' }}>Add The Task</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border-gray-300 border p-2 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder="Enter task title..."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full border-gray-300 border p-2 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Describe your task..."
          />
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date & Time
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full border-gray-300 border p-2 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
            {aiAdvice?.suggestion?.suggestedCategory && !formData.category && (
              <span className="text-blue-500 text-sm ml-2">
                (AI suggests: {aiAdvice.suggestion.suggestedCategory})
              </span>
            )}
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border-gray-300 border p-2 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select category</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
            {aiAdvice?.suggestion?.priority && (
              <span className="text-blue-500 text-sm ml-2">
                (AI suggests: {aiAdvice.suggestion.priority})
              </span>
            )}
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border-gray-300 border p-2 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Reminder */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="reminder"
            name="reminder"
            checked={formData.reminder}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="reminder" className="text-sm text-gray-700">
            Set reminder
            {aiAdvice?.suggestion?.reminder && (
              <span className="text-blue-500 ml-2">
                (AI suggests: {aiAdvice.suggestion.reminder})
              </span>
            )}
          </label>
        </div>

        {/* AI Loading State */}
        {isAiLoading && (
          <div className="flex items-center text-blue-500 text-sm">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Getting AI advice...
          </div>
        )}

        {/* AI Advice Display */}
        {aiAdvice && !isAiLoading && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-500 text-sm">
              <span className="font-medium">🤖 AI Advice:</span> {aiAdvice.analysis}
              {aiAdvice.suggestion && (
                <>
                  <br />
                  <span className="font-medium">Suggestion:</span> {aiAdvice.suggestion.priority} priority, {aiAdvice.suggestion.reminder}
                  {aiAdvice.suggestion.suggestedCategory && (
                    <>
                      <br />
                      <span className="font-medium">Suggested Category:</span> {aiAdvice.suggestion.suggestedCategory}
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim()}
          className="bg-blue-500 text-white hover:bg-blue-600 w-full py-2 px-4 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Task...
            </>
          ) : showSuccess ? (
            <>
              ✅ Task Added Successfully!
            </>
          ) : (
            'Add Task & Get AI Advice'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddTaskForm;