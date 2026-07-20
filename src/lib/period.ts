import type { Task } from "../types";

/** その週の開始(月曜0:00)を返す */
export function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0(日) - 6(土)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

/** その月の開始(1日0:00)を返す */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** タスクが「今の期間(週 or 月)」で完了済みかどうか */
export function isCompletedThisPeriod(task: Task, now: Date): boolean {
  if (!task.lastCompletedAt) return false;
  const completedAt = new Date(task.lastCompletedAt);
  const periodStart =
    task.category === "weekly" ? getWeekStart(now) : getMonthStart(now);
  return completedAt.getTime() >= periodStart.getTime();
}
