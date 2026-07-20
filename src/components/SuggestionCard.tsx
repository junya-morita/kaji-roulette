import type { Task } from "../types";

type Props = {
  tasks: Task[];
  usedMinutes: number;
  budgetMinutes: number;
  onConfirm: () => void;
  onDismiss: () => void;
};

export function SuggestionCard({
  tasks,
  usedMinutes,
  budgetMinutes,
  onConfirm,
  onDismiss,
}: Props) {
  return (
    <div className="result-card suggestion-card">
      <h2 className="result-name">今日の提案</h2>
      {tasks.length === 0 ? (
        <p className="result-description">
          今日の時間内でできるタスクが見つかりませんでした。
        </p>
      ) : (
        <>
          <ul className="suggestion-list">
            {tasks.map((task) => (
              <li key={task.id} className="suggestion-list-item">
                <span
                  className={`badge ${task.category === "weekly" ? "badge-weekly" : "badge-monthly"}`}
                >
                  {task.category === "weekly" ? "週1" : "月1"}
                </span>
                <span className="suggestion-item-name">{task.name}</span>
                <span className="badge badge-time">
                  {task.estimatedMinutes}分
                </span>
              </li>
            ))}
          </ul>
          <p className="result-description">
            合計 {usedMinutes}分 / {budgetMinutes}分
          </p>
        </>
      )}
      <div className="result-actions">
        <button className="btn btn-secondary" onClick={onDismiss}>
          閉じる
        </button>
        {tasks.length > 0 && (
          <button className="btn btn-primary" onClick={onConfirm}>
            全部やる
          </button>
        )}
      </div>
    </div>
  );
}
