import type { Task } from "../types";

type Props = {
  task: Task;
  onDo: () => void;
  onSkip: () => void;
};

export function ResultCard({ task, onDo, onSkip }: Props) {
  return (
    <div className="result-card">
      <span className={`badge badge-${task.category}`}>
        {task.category === "weekly" ? "週1" : "月1"}
      </span>
      <h2 className="result-name">{task.name}</h2>
      <p className="result-description">{task.description}</p>
      <div className="result-actions">
        <button className="btn btn-secondary" onClick={onSkip}>
          やらない
        </button>
        <button className="btn btn-primary" onClick={onDo}>
          やる
        </button>
      </div>
    </div>
  );
}
