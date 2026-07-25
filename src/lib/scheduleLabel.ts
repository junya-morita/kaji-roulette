import type { Category, Schedule } from "../types";

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export const CATEGORY_LABELS: Record<Category, string> = {
  weekly: "週1",
  biweekly: "隔週",
  monthly: "月1",
};

export function formatSchedule(
  schedule: Schedule | null,
  category: Category,
): string | null {
  if (!schedule) return null;
  if (schedule.type === "dayOfWeek") {
    const prefix = category === "biweekly" ? "隔週の" : "毎週";
    return `${prefix}${WEEKDAY_LABELS[schedule.dayOfWeek]}曜`;
  }
  if (schedule.type === "dayOfMonth") {
    return `毎月${schedule.dayOfMonth}日`;
  }
  return `第${schedule.nth}${WEEKDAY_LABELS[schedule.dayOfWeek]}曜日`;
}
