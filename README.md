# AI Task Reminder

AI-Powered Personal Task Reminder App built for Cursor Hackathon Victoria 2025. A minimalist full-stack MVP with intelligent task analysis and recommendations.

## 🚀 Features

- **AI-Powered Insights**: Get intelligent recommendations for every task using OpenAI GPT
- **Clean Minimalist UI**: Inspired by modern design principles with blue color scheme
- **Task Management**: Add, complete, and delete tasks with priority levels
- **Smart Categories**: Organize tasks by work, personal, health, learning, and more
- **Due Date Tracking**: Visual indicators for overdue and upcoming tasks
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI Integration**: Anthropic Claude (Haiku)
- **Styling**: PostCSS, Autoprefixer

## 📦 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Anthropic Claude API key

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd ai-task-reminder
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with your Anthropic Claude API key
   echo "API_KEY_ANTHROPIC=your_anthropic_api_key_here" > .env
   echo "PORT=5000" >> .env
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Development Server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser to** `http://localhost:5173`

The backend will run on port 5000, and the frontend will proxy API requests automatically.

## 🎯 Usage

1. **Add a Task**: Fill out the form with title, description, due date, category, and priority
2. **Get AI Advice**: Each task automatically receives personalized AI recommendations and suggested categories
3. **Smart Reminders**: Set reminders and get popup notifications when tasks are due
4. **Manage Tasks**: Check off completed tasks, expand to view AI advice, or delete tasks
5. **Track Progress**: Monitor your completion rate in the header

## 📁 Project Structure

```
ai-task-reminder/
├── backend/
│   ├── server.js          # Express server with Anthropic Claude integration
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables (create this)
└── frontend/
    ├── index.html
    ├── package.json       # Frontend dependencies
    ├── vite.config.js     # Vite configuration with API proxy
    ├── tailwind.config.js # Tailwind CSS configuration
    ├── postcss.config.js  # PostCSS configuration
    └── src/
        ├── main.jsx       # React entry point
        ├── App.jsx        # Main app component
        ├── index.css      # Global styles and Tailwind imports
        └── components/
            ├── AddTaskForm.jsx  # Task creation form
            └── TaskList.jsx     # Task display and management
```
