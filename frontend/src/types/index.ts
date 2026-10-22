// Define the types and interfaces for profiles, tasks, periods, and task statuses.
export type TaskPeriod = "morning" | "day" | "evening";

export type TaskStatus = "todo" | "done";

export interface Profile {
  id: number;
  name: string;
  avatar: string;
}

export interface Task {
  id: number;
  profileId: number;
  title: string;
  image?: string;
  period: TaskPeriod[];
  statusByPeriod: Partial<Record<TaskPeriod, TaskStatus>>;
}