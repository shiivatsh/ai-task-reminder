import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isBefore, sub, isAfter, differenceInMinutes } from 'date-fns';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';

const FEATURE_FLAGS = {
  SUSTAINABILITY_MODE: false,
  STORY_IP_MODE: false,
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(null);

  const handleTaskUpdate = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  // Reminder check interval - runs every 10 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.dueDate && !task.completed && !task.reminderShown) {
          const dueDate = new Date(task.dueDate);
          const minutesUntilDue = differenceInMinutes(dueDate, now);
          
          // Parse reminder time (default to 30 minutes if not specified)
          let reminderMinutes = 30; // default
          if (task.reminder) {
            if (typeof task.reminder === 'string') {
              if (task.reminder.includes('1 hour')) reminderMinutes = 60;
              else if (task.reminder.includes('2 hours')) reminderMinutes = 120;
              else if (task.reminder.includes('3 hours')) reminderMinutes = 180;
              else if (task.reminder.includes('6 hours')) reminderMinutes = 360;
              else if (task.reminder.includes('30 minutes')) reminderMinutes = 30;
              else if (task.reminder.includes('15 minutes')) reminderMinutes = 15;
            }
          }
          
          // Show reminder if we're within the reminder window
          if (minutesUntilDue <= reminderMinutes && minutesUntilDue > 0) {
            setShowReminderModal(task);
            // Mark as shown to prevent duplicate reminders
            task.reminderShown = true;
          }
          
          // Also show if task is overdue
          if (minutesUntilDue <= 0) {
            setShowReminderModal(task);
            task.reminderShown = true;
          }
        }
      });
    };

    // Check immediately
    checkReminders();
    
    // Then check every 10 seconds
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [tasks]);

  const refreshTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
      localStorage.setItem('tasks', JSON.stringify(res.data));
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  const addTask = async (taskData) => {
    try {
      // Create the task directly (AI analysis already done in form)
      const taskRes = await axios.post('/api/tasks', taskData);
      const newTask = taskRes.data;
      
      // Update local state
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Task Reminder</h1>
          <p className="text-lg font-semibold ml-4">Tasks: {tasks.length}</p>
        </div>
      </header>

      {/* Sustainability Mode Feature Flag */}
      {FEATURE_FLAGS.SUSTAINABILITY_MODE && (
        <div className="bg-green-100 p-2 rounded text-center">
          🌱 AI suggests eco-friendly tips!
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center p-4 bg-blue-50 rounded-lg mx-4 md:mx-auto md:w-1/2 mt-6">
        <div className="text-4xl mb-2">🔔</div>
        <p className="text-gray-700">Add a task. Let AI prioritize it. Get smart reminders.</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <AddTaskForm onAddTask={addTask} />
        <TaskList onTaskUpdate={handleTaskUpdate} />
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-80 md:w-96 mx-4">
            <h3 className="text-lg font-bold mb-4 text-center">🔔 Task Reminder</h3>
            
            <div className="mb-4">
              <p className="text-gray-800 font-medium mb-2">
                <strong>Reminder:</strong> {showReminderModal.title} due soon!
              </p>
              
              {showReminderModal.dueDate && (
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Due:</strong> {format(new Date(showReminderModal.dueDate), 'PPP p')}
                </p>
              )}
              
              {showReminderModal.analysis && (
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Analysis:</strong> {showReminderModal.analysis}
                </p>
              )}
              
              {showReminderModal.priority && (
                <p className="text-gray-700 text-sm">
                  <strong>Suggestion:</strong> {showReminderModal.priority} priority
                  {showReminderModal.reminder && `, ${showReminderModal.reminder}`}
                </p>
              )}
            </div>
            
            <div className="flex justify-center">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors font-medium"
                onClick={() => setShowReminderModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;