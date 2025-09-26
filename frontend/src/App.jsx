import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isBefore, sub, isAfter, differenceInMinutes } from 'date-fns';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';
import Landing from './components/Landing';
import AIAssistantCard from './components/AIAssistantCard';

const FEATURE_FLAGS = {
  SUSTAINABILITY_MODE: false, // Shows eco-friendly AI tips banner
  STORY_IP_MODE: false,       // Adds purple badges for creative tasks
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [currentTaskData, setCurrentTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: ''
  });

  const handleTaskUpdate = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const handleStartApp = () => {
    setShowLanding(false);
  };

  const handleTaskDataChange = (taskData) => {
    setCurrentTaskData(taskData);
  };

  // Initialize tasks from localStorage on app start
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
      }
    }
  }, []);

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

  // Show landing page first
  if (showLanding) {
    return <Landing onStart={handleStartApp} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="p-8 border-b border-gray-200" style={{ borderWidth: '0.5px' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Ticki Logo" className="w-6 h-6 text-black" />
            <span className="text-black font-medium text-lg" style={{ fontFamily: 'Montserrat' }}>Ticki</span>
          </div>
          
          {/* Task Counter */}
          <div className="text-black font-medium" style={{ fontFamily: 'Montserrat' }}>
            Tasks: {tasks.length}
          </div>
        </div>
      </header>

      {/* Sustainability Mode Feature Flag */}
      {FEATURE_FLAGS.SUSTAINABILITY_MODE && (
        <div className="bg-green-100 p-2 text-center border-b border-green-200">
          <p className="text-green-800 font-medium">🌱 AI suggests eco-friendly tips!</p>
        </div>
      )}

      {/* Two-Card Layout */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card - Task Input Form */}
          <AddTaskForm 
            onAddTask={addTask} 
            onTaskDataChange={handleTaskDataChange}
          />
          
          {/* Right Card - AI Assistant */}
          <AIAssistantCard taskData={currentTaskData} />
        </div>

        {/* Task List Below Cards */}
        <div className="mt-12">
          <TaskList onTaskUpdate={handleTaskUpdate} featureFlags={FEATURE_FLAGS} />
        </div>
      </main>

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