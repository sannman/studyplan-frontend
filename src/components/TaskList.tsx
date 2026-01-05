import type { Task, Priority } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Trash2 } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: () => void;
}

export function TaskList({ tasks, onTaskUpdated }: TaskListProps) {
  const { toast } = useToast();

  const handleStatusChange = async (taskName: string, newStatus: Priority) => {
    try {
      await apiService.updateTaskStatus(taskName, newStatus);
      toast({
        title: "Task updated",
        description: `Task status changed to ${newStatus}`,
      });
      onTaskUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (taskName: string) => {
    if (!confirm(`Are you sure you want to delete "${taskName}"?`)) {
      return;
    }

    try {
      await apiService.deleteTask(taskName);
      toast({
        title: "Task deleted",
        description: `"${taskName}" has been removed`,
      });
      onTaskUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-100 text-green-800";
    if (difficulty === 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No tasks yet. Create one to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.task_name}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{task.task_name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {task.timedue ? (
                    <span>
                      Due {formatDistanceToNow(new Date(task.timedue), { addSuffix: true })}
                    </span>
                  ) : (
                    <span>No due date</span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(task.task_name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(task.scale_difficulty)}`}>
                Difficulty: {task.scale_difficulty}/5
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <Select
                value={task.priority}
                onValueChange={(value) => handleStatusChange(task.task_name, value as Priority)}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
