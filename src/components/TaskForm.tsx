import { useState, type FormEvent } from "react";
import type { Category, Schedule, TaskFormValues } from "../types";
import { WEEKDAY_LABELS } from "../lib/scheduleLabel";

type MonthlyScheduleType = "" | "dayOfMonth" | "nthWeekday";

const DEFAULT_ESTIMATED_MINUTES = 15;
const DEFAULT_VALUES: TaskFormValues = {
  name: "",
  description: "",
  category: "weekly",
  estimatedMinutes: DEFAULT_ESTIMATED_MINUTES,
  schedule: null,
};

function isDayOfWeekCategory(category: Category): boolean {
  return category === "weekly" || category === "biweekly";
}

type Props = {
  initialValues?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
};

export function TaskForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const base = initialValues ?? DEFAULT_VALUES;
  const initialSchedule = base.schedule;

  const [name, setName] = useState(base.name);
  const [description, setDescription] = useState(base.description);
  const [category, setCategory] = useState<Category>(base.category);
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    base.estimatedMinutes,
  );
  const [dayOfWeekValue, setDayOfWeekValue] = useState<number | "">(
    initialSchedule?.type === "dayOfWeek" ? initialSchedule.dayOfWeek : "",
  );
  const [monthlyScheduleType, setMonthlyScheduleType] =
    useState<MonthlyScheduleType>(
      initialSchedule?.type === "dayOfMonth"
        ? "dayOfMonth"
        : initialSchedule?.type === "nthWeekday"
          ? "nthWeekday"
          : "",
    );
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState(
    initialSchedule?.type === "dayOfMonth" ? initialSchedule.dayOfMonth : 1,
  );
  const [monthlyNth, setMonthlyNth] = useState(
    initialSchedule?.type === "nthWeekday" ? initialSchedule.nth : 1,
  );
  const [monthlyWeekday, setMonthlyWeekday] = useState(
    initialSchedule?.type === "nthWeekday" ? initialSchedule.dayOfWeek : 0,
  );

  function handleCategoryChange(next: Category) {
    const wasMonthly = category === "monthly";
    const isMonthly = next === "monthly";
    setCategory(next);
    // 月1 ⇄ 週1・隔週の境界を跨ぐときだけ優先タイミングをリセットする
    // (週1⇄隔週は同じ曜日指定形式なのでそのまま保持できる)
    if (wasMonthly !== isMonthly) {
      setDayOfWeekValue("");
      setMonthlyScheduleType("");
      setMonthlyDayOfMonth(1);
      setMonthlyNth(1);
      setMonthlyWeekday(0);
    }
  }

  function buildSchedule(): Schedule | null {
    if (isDayOfWeekCategory(category)) {
      if (dayOfWeekValue === "") return null;
      return { type: "dayOfWeek", dayOfWeek: dayOfWeekValue };
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
    onSubmit({
      name: trimmedName,
      description: description.trim(),
      category,
      estimatedMinutes: Math.max(5, estimatedMinutes || DEFAULT_ESTIMATED_MINUTES),
      schedule: buildSchedule(),
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
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
            className={`chip ${category === "biweekly" ? "active" : ""}`}
            onClick={() => handleCategoryChange("biweekly")}
          >
            隔週
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

      {isDayOfWeekCategory(category) ? (
        <label className="form-field">
          <span>優先タイミング(任意・曜日)</span>
          <select
            value={dayOfWeekValue}
            onChange={(e) =>
              setDayOfWeekValue(
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
                setMonthlyScheduleType(e.target.value as MonthlyScheduleType)
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
                onChange={(e) => setMonthlyDayOfMonth(Number(e.target.value))}
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
                  onChange={(e) => setMonthlyWeekday(Number(e.target.value))}
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

      <div className="task-form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
