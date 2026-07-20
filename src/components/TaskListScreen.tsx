import { useState, type FormEvent } from "react";
import type { Category, Task } from "../types";
import { isCompletedThisPeriod } from "../lib/period";

type Props = {
  tasks: Task[];
  addTask: (name: string, description: string, category: Category) => void;
  deleteTask: (id: string) => void;
  markDone: (id: string) => void;
  markUndone: (id: string) => void;
};

export function TaskListScreen({
  tasks,
  addTask,
  deleteTask,
  markDone,
  markUndone,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("weekly");

  const now = new Date();
  const weeklyTasks = tasks.filter((t) => t.category === "weekly");
  const monthlyTasks = tasks.filter((t) => t.category === "monthly");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addTask(trimmedName, description.trim(), category);
    setName("");
    setDescription("");
  }

  function renderSection(title: string, list: Task[]) {
    return (
      <section className="task-section">
        <h3>{title}</h3>
        {list.length === 0 ? (
          <p className="empty-hint">まだタスクがありません</p>
        ) : (
          <ul className="task-list">
            {list.map((task) => {
              const done = isCompletedThisPeriod(task, now);
              return (
                <li key={task.id} className="task-item">
                  <div className="task-item-main">
                    <div className="task-item-header">
                      <span className="task-name">{task.name}</span>
                      <span
                        className={`status-badge ${done ? "done" : "todo"}`}
                      >
                        {done ? "完了" : "未完了"}
                      </span>
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                  </div>
                  <div className="task-item-actions">
                    <button
                      className="btn btn-small"
                      onClick={() =>
                        done ? markUndone(task.id) : markDone(task.id)
                      }
                    >
                      {done ? "未完了に戻す" : "完了にする"}
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => deleteTask(task.id)}
                    >
                      削除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  return (
    <div className="screen list-screen">
      {renderSection("週1タスク", weeklyTasks)}
      {renderSection("月1タスク", monthlyTasks)}

      <section className="task-add-form">
        <h3>タスクを追加</h3>
        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>タスク名</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例:窓ふき"
              required
            />
          </label>
          <label className="form-field">
            <span>説明(任意)</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例:リビングの窓を拭く"
            />
          </label>
          <div className="form-field">
            <span>頻度</span>
            <div className="category-toggle">
              <button
                type="button"
                className={`chip ${category === "weekly" ? "active" : ""}`}
                onClick={() => setCategory("weekly")}
              >
                週1
              </button>
              <button
                type="button"
                className={`chip ${category === "monthly" ? "active" : ""}`}
                onClick={() => setCategory("monthly")}
              >
                月1
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            追加する
          </button>
        </form>
      </section>
    </div>
  );
}
