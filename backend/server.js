const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const PORT = 5001;

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

// OpenAI prioritize endpoint - updated to exact specification
app.post('/prioritize', async (req, res) => {
  const { title, description, dueDate, category } = req.body;
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Analyze this task for urgency and importance. 
        Title: ${title}, Description: ${description}, Due: ${dueDate}, Category: ${category || 'none'}.
        Detect urgency (due date < 24h, keywords 'urgent','must','asap','deadline') 
        and importance ('critical','client','important').
        If category empty, suggest one ('client'/'meeting'→work; 'family'/'home'→personal; 'shopping'/'buy'→shopping).
        Return JSON only: { 
          analysis: '2-3 sentences explaining priority',
          suggestion: { 
            priority: 'low/medium/high', 
            reminder: 'e.g., 2 hours before', 
            suggestedCategory: 'string' 
          }
        }`
      }],
      response_format: { type: "json_object" },
      max_tokens: 250
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
    
  } catch (error) {
    console.log('OpenAI error, using fallback:', error.message);
    
    // Fallback logic
    const now = new Date();
    const due = new Date(dueDate);
    const hoursDiff = (due - now) / (1000 * 60 * 60);
    const text = (title + ' ' + description).toLowerCase();
    
    let priority = 'low';
    let analysis = 'Default analysis: Medium priority';
    let suggestedCategory = category;
    
    if (hoursDiff < 24 || /urgent|must|asap|deadline/i.test(text)) {
      priority = 'high';
      analysis = 'Analysis: High urgency due to close deadline or urgent keywords';
    } else if (hoursDiff < 72) {
      priority = 'medium';
      analysis = 'Analysis: Moderate urgency with medium time remaining';
    }
    
    if (!category) {
      if (/client|meeting|work/i.test(text)) suggestedCategory = 'work';
      else if (/family|home/i.test(text)) suggestedCategory = 'personal';
      else if (/shopping|buy/i.test(text)) suggestedCategory = 'shopping';
      else suggestedCategory = 'other';
    }
    
    res.json({
      analysis,
      suggestion: { 
        priority, 
        reminder: priority === 'high' ? '1 hour before' : '3 hours before', 
        suggestedCategory 
      }
    });
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