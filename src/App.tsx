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
    <div className="min-h-screen bg-[#f7f6f3] text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">EduTech Study Planner</h1>
                <p className="text-sm text-muted-foreground">
                  Personalized study plan generator
                </p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-medium text-slate-600">
              Notion-inspired workspace
            </div>
          </div>
          {connectionStatus === "error" && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">
                ⚠️ Cannot connect to backend. Make sure the API server is running on port 5000.
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Study Desk</p>
              <h2 className="text-2xl font-semibold">Organize tasks, capture progress, plan smart</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              {connectionStatus === "connected" ? "Connected to API" : "Checking connection"}
            </div>
          </div>

          <div className="mb-8">
            <StatsCard key={tasks.length} />
          </div>

          <Tabs defaultValue="tasks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 rounded-xl border border-slate-200 bg-[#f7f6f3] p-1 shadow-inner">
              <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="create" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Create Task
              </TabsTrigger>
              <TabsTrigger value="plan" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Study Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
              {loading ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : (
                <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} />
              )}
            </TabsContent>

            <TabsContent value="create" className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <TaskForm onTaskCreated={handleTaskUpdated} />
            </TabsContent>

            <TabsContent value="plan" className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <StudyPlanGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="mt-12 border-t bg-white/70">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>EduTech Study Planner • Built with React & shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
