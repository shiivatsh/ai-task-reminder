const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-xxxx'
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory task storage (for MVP)
let tasks = [];
let taskIdCounter = 1;

// Helper function to get AI analysis
async function getAIAnalysis(title, description, dueDate, category) {
  try {
    const prompt = `Analyze this task and provide brief advice (max 50 words):
    Title: ${title}
    Description: ${description}
    Due Date: ${dueDate}
    Category: ${category}
    
    Provide actionable advice for completing this task efficiently.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Focus on breaking this task into smaller steps.";
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "Focus on breaking this task into smaller steps and tackle them one by one.";
  }
}

// New OpenAI prioritize endpoint as requested
app.post('/api/prioritize', async (req, res) => {
  try {
    const { title, description, dueDate, category } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Analyze this task for urgency and importance. Task: "${title}" - Description: "${description}" - Due: ${dueDate} - Category: ${category}. 
        Return JSON only: {
          analysis: "2-3 sentence explanation in Persian/English",
          suggestion: {
            priority: "low/medium/high", 
            reminder: "e.g., 1 hour before",
            confidence: 0.85
          }
        }`
      }],
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
    
  } catch (error) {
    console.log('OpenAI failed, using simulation:', error.message);
    
    // Fallback به شبیه‌سازی هوشمند
    const simulateAI = (title, description, dueDate) => {
      const text = (title + ' ' + description).toLowerCase();
      const hoursLeft = (new Date(dueDate) - new Date()) / (1000 * 60 * 60);
      
      let priority = 'medium';
      let reminder = '3 hours before';
      
      if (hoursLeft < 24 || text.includes('urgent') || text.includes('فوری')) {
        priority = 'high';
        reminder = '1 hour before';
      } else if (hoursLeft > 72 && !text.includes('important')) {
        priority = 'low';
        reminder = '6 hours before';
      }
      
      return {
        analysis: `تحلیل: این تسک ${priority} اولویت دارد. زمان باقی‌مانده: ${Math.round(hoursLeft)} ساعت.`,
        suggestion: { priority, reminder, confidence: 0.9 }
      };
    };
    
    const simulated = simulateAI(req.body.title, req.body.description, req.body.dueDate);
    res.json(simulated);
  }
});

// Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, dueDate, category, priority, reminder } = req.body;
    
    // Get AI analysis
    const analysis = await getAIAnalysis(title, description, dueDate, category);
    
    const newTask = {
      id: taskIdCounter++,
      title,
      description,
      dueDate,
      category,
      priority: priority || 'medium',
      reminder: reminder || false,
      analysis,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});