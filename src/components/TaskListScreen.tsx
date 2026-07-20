import { useState, type FormEvent } from "react";
import type { Category, Schedule, Task } from "../types";
import { isCompletedThisPeriod, isPriorityDue } from "../lib/period";
import { formatSchedule, WEEKDAY_LABELS } from "../lib/scheduleLabel";

type Props = {
  tasks: Task[];
  addTask: (
    name: string,
    description: string,
    category: Category,
    estimatedMinutes: number,
    schedule: Schedule | null,
  ) => void;
  deleteTask: (id: string) => void;
  markDone: (id: string) => void;
  markUndone: (id: string) => void;
  setTaskEnabled: (id: string, enabled: boolean) => void;
  setTaskCategory: (id: string, category: Category) => void;
};

type MonthlyScheduleType = "" | "dayOfMonth" | "nthWeekday";

const DEFAULT_ESTIMATED_MINUTES = 15;

export function TaskListScreen({
  tasks,
  addTask,
  deleteTask,
  markDone,
  markUndone,
  setTaskEnabled,
  setTaskCategory,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("weekly");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    DEFAULT_ESTIMATED_MINUTES,
  );
  const [weeklyDayOfWeek, setWeeklyDayOfWeek] = useState<number | "">("");
  const [monthlyScheduleType, setMonthlyScheduleType] =
    useState<MonthlyScheduleType>("");
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState(1);
  const [monthlyNth, setMonthlyNth] = useState(1);
  const [monthlyWeekday, setMonthlyWeekday] = useState(0);

  const now = new Date();
  const weeklyTasks = tasks.filter((t) => t.category === "weekly");
  const monthlyTasks = tasks.filter((t) => t.category === "monthly");

  function resetScheduleFields() {
    setWeeklyDayOfWeek("");
    setMonthlyScheduleType("");
    setMonthlyDayOfMonth(1);
    setMonthlyNth(1);
    setMonthlyWeekday(0);
  }

  function handleCategoryChange(next: Category) {
    setCategory(next);
    resetScheduleFields();
  }

  function buildSchedule(): Schedule | null {
    if (category === "weekly") {
      if (weeklyDayOfWeek === "") return null;
      return { type: "dayOfWeek", dayOfWeek: weeklyDayOfWeek };
    }
    if (monthlyScheduleType === "dayOfMonth") {
      return { type: "dayOfMonth", dayOfMonth: monthlyDayOfMonth };
    }
    if (monthlyScheduleType === "nthWeekday") {
      return { type: "nthWeekday", nth: monthlyNth, dayOfWeek: monthlyWeekday };
    }
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const minutes = Math.max(5, estimatedMinutes || DEFAULT_ESTIMATED_MINUTES);
    addTask(trimmedName, description.trim(), category, minutes, buildSchedule());
    setName("");
    setDescription("");
    setEstimatedMinutes(DEFAULT_ESTIMATED_MINUTES);
    resetScheduleFields();
  }

  function handleCategorySwitch(task: Task) {
    const nextCategory: Category =
      task.category === "weekly" ? "monthly" : "weekly";
    if (task.schedule) {
      const ok = window.confirm(
        "優先タイミングの設定はリセットされます。切り替えますか?",
      );
      if (!ok) return;
    }
    setTaskCategory(task.id, nextCategory);
  }

  function handleDelete(task: Task) {
    const ok = window.confirm(`「${task.name}」を削除します。元に戻せません。`);
    if (ok) deleteTask(task.id);
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
              const priority = isPriorityDue(task, now);
              const scheduleLabel = formatSchedule(task.schedule);
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
                          onClick={() => handleCategorySwitch(task)}
                        >
                          {task.category === "weekly"
                            ? "月1に切替"
                            : "週1に切替"}
                        </button>
                        <button
                          className="btn btn-small"
                          onClick={() => setTaskEnabled(task.id, false)}
                        >
                          無効にする
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-small"
                        onClick={() => setTaskEnabled(task.id, true)}
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
          <label className="form-field">
            <span>想定時間(分)</span>
            <input
              type="number"
              step={5}
              min={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
          </label>
          <div className="form-field">
            <span>頻度</span>
            <div className="category-toggle">
              <button
                type="button"
                className={`chip ${category === "weekly" ? "active" : ""}`}
                onClick={() => handleCategoryChange("weekly")}
              >
                週1
              </button>
              <button
                type="button"
                className={`chip ${category === "monthly" ? "active" : ""}`}
                onClick={() => handleCategoryChange("monthly")}
              >
                月1
              </button>
            </div>
          </div>

          {category === "weekly" ? (
            <label className="form-field">
              <span>優先タイミング(任意・曜日)</span>
              <select
                value={weeklyDayOfWeek}
                onChange={(e) =>
                  setWeeklyDayOfWeek(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                <option value="">指定しない</option>
                {WEEKDAY_LABELS.map((label, index) => (
                  <option key={index} value={index}>
                    {label}曜日
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label className="form-field">
                <span>優先タイミング(任意)</span>
                <select
                  value={monthlyScheduleType}
                  onChange={(e) =>
                    setMonthlyScheduleType(
                      e.target.value as MonthlyScheduleType,
                    )
                  }
                >
                  <option value="">指定しない</option>
                  <option value="dayOfMonth">日付を指定</option>
                  <option value="nthWeekday">第N週の曜日を指定</option>
                </select>
              </label>
              {monthlyScheduleType === "dayOfMonth" && (
                <label className="form-field">
                  <span>毎月何日</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={monthlyDayOfMonth}
                    onChange={(e) =>
                      setMonthlyDayOfMonth(Number(e.target.value))
                    }
                  />
                </label>
              )}
              {monthlyScheduleType === "nthWeekday" && (
                <div className="form-field">
                  <span>第何週の何曜日</span>
                  <div className="nth-weekday-row">
                    <select
                      value={monthlyNth}
                      onChange={(e) => setMonthlyNth(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          第{n}
                        </option>
                      ))}
                    </select>
                    <select
                      value={monthlyWeekday}
                      onChange={(e) =>
                        setMonthlyWeekday(Number(e.target.value))
                      }
                    >
                      {WEEKDAY_LABELS.map((label, index) => (
                        <option key={index} value={index}>
                          {label}曜日
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary">
            追加する
          </button>
        </form>
      </section>
    </div>
  );
}
