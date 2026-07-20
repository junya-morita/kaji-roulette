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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 月内でその曜日がnth回目に出現する日付。存在しなければnull */
export function getNthWeekdayOfMonth(
  year: number,
  month: number,
  nth: number,
  dayOfWeek: number,
): Date | null {
  const firstDay = new Date(year, month, 1);
  const offset = (dayOfWeek - firstDay.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  const date = new Date(year, month, day);
  if (date.getMonth() !== month) return null;
  return date;
}

/** 現在の週/月における、そのタスクのスケジュール該当日(未指定や無効な日付はnull) */
export function getScheduledDateInPeriod(task: Task, now: Date): Date | null {
  const schedule = task.schedule;
  if (!schedule) return null;

  if (schedule.type === "dayOfWeek") {
    const weekStart = getWeekStart(now);
    const offset = schedule.dayOfWeek === 0 ? 6 : schedule.dayOfWeek - 1;
    const date = new Date(weekStart);
    date.setDate(date.getDate() + offset);
    return date;
  }

  if (schedule.type === "dayOfMonth") {
    const monthStart = getMonthStart(now);
    const date = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      schedule.dayOfMonth,
    );
    if (date.getMonth() !== monthStart.getMonth()) return null;
    return date;
  }

  // nthWeekday
  return getNthWeekdayOfMonth(
    now.getFullYear(),
    now.getMonth(),
    schedule.nth,
    schedule.dayOfWeek,
  );
}

/** 優先タイミングが設定されていて、指定日を過ぎてもまだ未完了かどうか */
export function isPriorityDue(task: Task, now: Date): boolean {
  if (!task.enabled) return false;
  if (isCompletedThisPeriod(task, now)) return false;
  const scheduledDate = getScheduledDateInPeriod(task, now);
  if (!scheduledDate) return false;
  return startOfDay(now).getTime() >= startOfDay(scheduledDate).getTime();
}
