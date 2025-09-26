import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isBefore, sub } from 'date-fns';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';

const FEATURE_FLAGS = {
  SUSTAINABILITY_MODE: false,
  STORY_IP_MODE: false,
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/api/tasks');
        setTasks(res.data);
        localStorage.setItem('tasks', JSON.stringify(res.data));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach(task => {
        if (task.reminder && task.dueDate && !task.completed) {
          const reminderTime = parseReminder(task.reminder, task.dueDate);
          if (isBefore(new Date(), reminderTime)) {
            setShowModal(task);
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const parseReminder = (reminder, dueDate) => {
    const due = new Date(dueDate);
    if (typeof reminder === 'string' && reminder.includes('hour')) {
      const hours = parseInt(reminder);
      return sub(due, { hours });
    }
    return due;
  };

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
      setTasks(prev => [...prev, newTask]);
      localStorage.setItem('tasks', JSON.stringify([...tasks, newTask]));
      
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
        <TaskList tasks={tasks} onUpdateTask={async (taskId, updates) => {
          try {
            await axios.put(`/api/tasks/${taskId}`, updates);
            refreshTasks();
          } catch (error) {
            console.error('Error updating task:', error);
          }
        }} onDeleteTask={async (taskId) => {
          try {
            await axios.delete(`/api/tasks/${taskId}`);
            refreshTasks();
          } catch (error) {
            console.error('Error deleting task:', error);
          }
        }} />
      </div>

      {/* Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 md:w-96 mx-4">
            <h3 className="text-lg font-bold mb-2">🔔 Task Reminder</h3>
            <p className="mb-2"><strong>Task:</strong> {showModal.title}</p>
            <p className="mb-2"><strong>Due:</strong> {showModal.dueDate ? format(new Date(showModal.dueDate), 'PPP') : 'No due date'}</p>
            <p className="mb-4"><strong>AI Analysis:</strong> {showModal.analysis}</p>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => setShowModal(null)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;