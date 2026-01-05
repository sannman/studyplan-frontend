import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { StatsCard } from "@/components/StatsCard";
import { StudyPlanGenerator } from "@/components/StudyPlanGenerator";
import { apiService } from "@/services/api";
import type { Task } from "@/types/task";
import { BookOpen } from "lucide-react";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");

  useEffect(() => {
    checkConnection();
    loadTasks();
  }, []);

  const checkConnection = async () => {
    try {
      await apiService.healthCheck();
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Backend connection failed:", error);
      setConnectionStatus("error");
    }
  };

  const loadTasks = async () => {
    try {
      const data = await apiService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdated = () => {
    loadTasks();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">EduTech Study Planner</h1>
              <p className="text-sm text-muted-foreground">
                Personalized study plan generator
              </p>
            </div>
          </div>
          {connectionStatus === "error" && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                ⚠️ Cannot connect to backend. Make sure the API server is running on port 5000.
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <StatsCard key={tasks.length} />
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="create">Create Task</TabsTrigger>
            <TabsTrigger value="plan">Study Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : (
              <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} />
            )}
          </TabsContent>

          <TabsContent value="create">
            <TaskForm onTaskCreated={handleTaskUpdated} />
          </TabsContent>

          <TabsContent value="plan">
            <StudyPlanGenerator />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>EduTech Study Planner • Built with React & shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
