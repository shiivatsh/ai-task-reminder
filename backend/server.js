const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.API_KEY_ANTHROPIC,
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory task storage (for MVP)
let tasks = [];
let taskIdCounter = 1;

// Helper function to get AI analysis and suggested category
async function getAIAnalysis(title, description, dueDate, category) {
  try {
    const prompt = `Analyze this task and provide:
    1. Brief actionable advice (max 50 words)
    2. Suggested category if none provided (work/personal/health/learning/finance/other)
    
    Task Details:
    Title: ${title}
    Description: ${description}
    Due Date: ${dueDate}
    Current Category: ${category || 'none'}
    
    Format response as: ADVICE: [your advice] | CATEGORY: [suggested category]`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const content = response.content[0]?.text || "ADVICE: Focus on breaking this task into smaller steps. | CATEGORY: other";
    const parts = content.split(' | ');
    const advice = parts[0]?.replace('ADVICE: ', '') || "Focus on breaking this task into smaller steps.";
    const suggestedCategory = parts[1]?.replace('CATEGORY: ', '') || category || 'other';

    return { advice, suggestedCategory };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return { 
      advice: "Focus on breaking this task into smaller steps and tackle them one by one.",
      suggestedCategory: category || 'other'
    };
  }
}

// Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, dueDate, category, priority, reminder } = req.body;
    
    // Get AI analysis and suggested category
    const { advice, suggestedCategory } = await getAIAnalysis(title, description, dueDate, category);
    
    const newTask = {
      id: taskIdCounter++,
      title,
      description,
      dueDate,
      category: category || suggestedCategory,
      priority: priority || 'medium',
      reminder: reminder || false,
      analysis: advice,
      suggestedCategory,
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
