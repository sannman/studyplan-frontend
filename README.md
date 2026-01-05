# EduTech Study Planner - Frontend

A React-based frontend application for the EduTech personalized study plan generator. Built with React, TypeScript, Vite, and shadcn/ui.

## Features

- **Task Management**: Create, update, and delete study tasks
- **Priority System**: Track tasks with Pending, Ongoing, and Completed statuses
- **Difficulty Levels**: Rate tasks from 1 (very easy) to 5 (very hard)
- **Study Plan Generation**: Automatically generate personalized study schedules
- **Statistics Dashboard**: View completion rates, overdue tasks, and progress
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:5000 (see [studyplan-backend](https://github.com/sannman/studyplan-backend))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sannman/studyplan-frontend.git
cd studyplan-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env to set your API URL if different from default
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── TaskForm.tsx    # Task creation form
│   ├── TaskList.tsx    # Task list display
│   ├── StatsCard.tsx   # Statistics dashboard
│   └── StudyPlanGenerator.tsx  # Study plan generator
├── services/           # API service layer
│   └── api.ts         # Backend API integration
├── types/             # TypeScript type definitions
│   └── task.ts        # Task-related types
├── lib/               # Utility functions
│   └── utils.ts       # Helper utilities
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Usage

### Creating Tasks

1. Navigate to the "Create Task" tab
2. Fill in the task details:
   - Task name
   - Difficulty level (1-5)
   - Priority status
   - Due date
3. Click "Create Task"

### Managing Tasks

- View all tasks in the "Tasks" tab
- Change task status using the dropdown menu
- Delete tasks using the trash icon
- See time remaining until due dates

### Generating Study Plans

1. Navigate to the "Study Plan" tab
2. Set your available hours per day
3. Set your preferred session duration
4. Click "Generate Study Plan"
5. View your personalized schedule with prioritized tasks

## API Configuration

The frontend expects the backend API to be available at the URL specified in the `.env` file:

```
VITE_API_BASE_URL=http://localhost:5000
```

Make sure the backend is running before starting the frontend application.

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Radix UI**: Accessible component primitives
- **date-fns**: Date formatting and manipulation
- **Lucide React**: Icon library

## License

MIT
