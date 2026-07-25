import { useState } from "react";
import type { Category, Task, TaskFormValues } from "../types";
import { isCompletedThisPeriod, isPriorityDue } from "../lib/period";
import { formatSchedule } from "../lib/scheduleLabel";
import { TaskForm } from "./TaskForm";

type Props = {
  tasks: Task[];
  addTask: (values: TaskFormValues) => void;
  deleteTask: (id: string) => void;
  markDone: (id: string) => void;
  markUndone: (id: string) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
};

const SECTIONS: Array<{ category: Category; title: string }> = [
  { category: "weekly", title: "週1タスク" },
  { category: "biweekly", title: "隔週タスク" },
  { category: "monthly", title: "月1タスク" },
];

export function TaskListScreen({
  tasks,
  addTask,
  deleteTask,
  markDone,
  markUndone,
  updateTask,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const now = new Date();

  function handleDelete(task: Task) {
    const ok = window.confirm(`「${task.name}」を削除します。元に戻せません。`);
    if (ok) deleteTask(task.id);
  }

  function handleEditSubmit(id: string, values: TaskFormValues) {
    updateTask(id, values);
    setEditingId(null);
  }

  function renderSection(title: string, list: Task[]) {
    return (
      <section className="task-section" key={title}>
        <h3>{title}</h3>
        {list.length === 0 ? (
          <p className="empty-hint">まだタスクがありません</p>
        ) : (
          <ul className="task-list">
            {list.map((task) => {
              if (editingId === task.id) {
                return (
                  <li key={task.id} className="task-item task-item-editing">
                    <TaskForm
                      initialValues={{
                        name: task.name,
                        description: task.description,
                        category: task.category,
                        estimatedMinutes: task.estimatedMinutes,
                        schedule: task.schedule,
                      }}
                      submitLabel="保存"
                      onSubmit={(values) => handleEditSubmit(task.id, values)}
                      onCancel={() => setEditingId(null)}
                    />
                  </li>
                );
              }

              const done = isCompletedThisPeriod(task, now);
              const priority = isPriorityDue(task, now);
              const scheduleLabel = formatSchedule(
                task.schedule,
                task.category,
              );
              return (
                <li
                  key={task.id}
                  className={`task-item ${task.enabled ? "" : "task-item-disabled"}`}
                >
                  <div className="task-item-main">
                    <div className="task-item-header">
                      <span className="task-name">{task.name}</span>
                      <span
                        className={`status-badge ${done ? "done" : "todo"}`}
                      >
                        {done ? "完了" : "未完了"}
                      </span>
                      <span className="badge badge-time">
                        {task.estimatedMinutes}分
                      </span>
                      {scheduleLabel && (
                        <span className="badge badge-schedule">
                          {scheduleLabel}
                        </span>
                      )}
                      {priority && (
                        <span className="badge badge-priority">優先</span>
                      )}
                      {!task.enabled && (
                        <span className="badge badge-disabled">無効</span>
                      )}
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                  </div>
                  <div className="task-item-actions">
                    {task.enabled ? (
                      <>
                        <button
                          className="btn btn-small"
                          onClick={() =>
                            done ? markUndone(task.id) : markDone(task.id)
                          }
                        >
                          {done ? "未完了に戻す" : "完了にする"}
                        </button>
                        <button
                          className="btn btn-small"
                          onClick={() => setEditingId(task.id)}
                        >
                          編集
                        </button>
                        <button
                          className="btn btn-small"
                          onClick={() => updateTask(task.id, { enabled: false })}
                        >
                          無効にする
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-small"
                        onClick={() => updateTask(task.id, { enabled: true })}
                      >
                        有効にする
                      </button>
                    )}
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(task)}
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
      {SECTIONS.map(({ category, title }) =>
        renderSection(
          title,
          tasks.filter((t) => t.category === category),
        ),
      )}

      <section className="task-add-form">
        <h3>タスクを追加</h3>
        <TaskForm submitLabel="追加する" onSubmit={addTask} />
      </section>
    </div>
  );
}
