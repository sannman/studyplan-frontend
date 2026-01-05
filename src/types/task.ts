export type Priority = "Pending" | "Ongoing" | "Completed";

export interface Task {
  task_name: string;
  scale_difficulty: number;
  priority: Priority;
  createdAt: string;
  timedue: string;
}

export interface TaskScore {
  task_name: string;
  score: number;
  difficulty: number;
  priority: Priority;
  timedue: string;
}

export interface StudyPlanSession {
  task_name: string;
  priority_score: number;
  difficulty: number;
  priority: Priority;
  timedue: string;
  start_time: string;
  end_time: string;
  duration: number;
  note?: string;
}

export interface StudyPlan {
  schedule: StudyPlanSession[];
  total_tasks: number;
  total_study_hours: number;
  available_hours_per_day: number;
  study_session_duration: number;
  adjustment_reason?: string;
}

export interface Stats {
  total_tasks: number;
  pending: number;
  ongoing: number;
  completed: number;
  overdue: number;
  completion_rate: number;
  average_difficulty: number;
}
