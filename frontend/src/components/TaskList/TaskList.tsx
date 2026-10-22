import type { Task, TaskPeriod } from "../../types";
import TaskCard from "../TaskCard/TaskCard";
import "./TaskList.css";

// Define the props for the task list and its task action handlers.
interface TaskListProps {
  tasks: Task[];
  period: TaskPeriod;
  onComplete: (taskId: number, period: TaskPeriod) => void;
  onUndo: (taskId: number, period: TaskPeriod) => void;
  onDelete: (taskId: number) => void;
}

// Display a message if the task list is empty.
function TaskList({
  tasks,
  period,
  onComplete,
  onUndo,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="task-list">
        <p className="task-list-empty">Inga uppgifter ännu.</p>
      </section>
    );
  }

  return (
    <section className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          period={period}
          onComplete={onComplete}
          onUndo={onUndo}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

export default TaskList;
