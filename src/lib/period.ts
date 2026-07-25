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

// 隔週サイクルの固定基準(2024/1/1は月曜日)。ユーザーが起点を意識しなくてよいよう、
// 全タスク共通でこの日から2週間ごとに区切る。
const BIWEEKLY_REFERENCE_MONDAY = new Date(2024, 0, 1);

/** その週を含む2週間サイクルの開始(1週目の月曜0:00)を返す */
export function getBiweeklyPeriodStart(now: Date): Date {
  const thisWeekStart = getWeekStart(now);
  const weeksSince = Math.round(
    (thisWeekStart.getTime() - BIWEEKLY_REFERENCE_MONDAY.getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );
  const isSecondWeekOfCycle = ((weeksSince % 2) + 2) % 2 === 1;
  if (!isSecondWeekOfCycle) return thisWeekStart;
  const prevWeekStart = new Date(thisWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  return prevWeekStart;
}

function getPeriodStart(category: Task["category"], now: Date): Date {
  if (category === "weekly") return getWeekStart(now);
  if (category === "biweekly") return getBiweeklyPeriodStart(now);
  return getMonthStart(now);
}

/** タスクが「今の期間(週・隔週・月)」で完了済みかどうか */
export function isCompletedThisPeriod(task: Task, now: Date): boolean {
  if (!task.lastCompletedAt) return false;
  const completedAt = new Date(task.lastCompletedAt);
  const periodStart = getPeriodStart(task.category, now);
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
    // weekly/biweeklyで共有: biweeklyはサイクル1週目のその曜日を指す
    const periodStart =
      task.category === "biweekly"
        ? getBiweeklyPeriodStart(now)
        : getWeekStart(now);
    const offset = schedule.dayOfWeek === 0 ? 6 : schedule.dayOfWeek - 1;
    const date = new Date(periodStart);
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
