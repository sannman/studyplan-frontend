import type { Task, TaskScore, StudyPlan, Stats, Priority } from "../types/task";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request("/health");
  }

  // Task management
  async createTask(task: Omit<Task, "createdAt">): Promise<{ status: string; message: string }> {
    return this.request("/post_task", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async getTasks(): Promise<Task[]> {
    return this.request("/get_tasks");
  }

  async updateTaskStatus(
    taskName: string,
    newStatus: Priority
  ): Promise<{ status: string; message: string }> {
    return this.request("/update_task_status", {
      method: "PUT",
      body: JSON.stringify({
        task_name: taskName,
        new_status: newStatus,
      }),
    });
  }

  async deleteTask(taskName: string): Promise<{ status: string; message: string }> {
    return this.request(`/delete_task/${encodeURIComponent(taskName)}`, {
      method: "DELETE",
    });
  }

  async getTasksByStatus(status: Priority): Promise<{ status: string; count: number; tasks: Task[] }> {
    return this.request(`/tasks_by_status/${status}`);
  }

  // Study planning
  async getTaskScores(): Promise<{ scores: TaskScore[] }> {
    return this.request("/score_tasks");
  }

  async generateStudyPlan(
    availableHoursPerDay: number = 4.0,
    studySessionDuration: number = 1.0
  ): Promise<StudyPlan> {
    return this.request("/generate_plan", {
      method: "POST",
      body: JSON.stringify({
        available_hours_per_day: availableHoursPerDay,
        study_session_duration: studySessionDuration,
      }),
    });
  }

  async markTaskAsMissed(taskName: string): Promise<{
    status: string;
    missed_task: string;
    updated_plan: StudyPlan;
  }> {
    return this.request(`/mark_missed/${encodeURIComponent(taskName)}`, {
      method: "POST",
    });
  }

  // Task queries
  async getUpcomingTasks(daysAhead: number = 7): Promise<{
    days_ahead: number;
    count: number;
    tasks: Task[];
  }> {
    return this.request(`/upcoming_tasks?days_ahead=${daysAhead}`);
  }

  async getOverdueTasks(): Promise<{ count: number; tasks: Task[] }> {
    return this.request("/overdue_tasks");
  }

  async getStats(): Promise<Stats> {
    return this.request("/stats");
  }
}

export const apiService = new ApiService(API_BASE_URL);
