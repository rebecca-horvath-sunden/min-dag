import "./TaskCard.css";
import type { Task, TaskPeriod } from "../../types";

interface TaskCardProps {
  task: Task;
  period: TaskPeriod;
  onComplete: (taskId: number, period: TaskPeriod) => void;
  onUndo: (taskId: number, period: TaskPeriod) => void;
  onDelete: (taskId: number) => void;
}

function TaskCard({
  task,
  period,
  onComplete,
  onUndo,
  onDelete,
}: TaskCardProps) {
  const status = task.statusByPeriod[period] ?? "todo";

  return (
    <article
      className={status === "done" ? "task-card task-card--done" : "task-card"}
    >
      {task.image && <span>{task.image}</span>}

      <span>{task.title}</span>

      <button
        type="button"
        className={`task-status-button task-status-button--${status}`}
        onClick={() =>
          status === "todo"
            ? onComplete(task.id, period)
            : onUndo(task.id, period)
        }
        aria-label={
          status === "todo"
            ? `Markera ${task.title} som klar`
            : `Ångra att ${task.title} är klar`
        }
      >
        ✓
      </button>

      <button
        type="button"
        className="task-delete-button"
        onClick={() => onDelete(task.id)}
        aria-label={`Ta bort ${task.title}`}
        title="Ta bort uppgift"
      >
        ✕
      </button>
    </article>
  );
}

export default TaskCard;
