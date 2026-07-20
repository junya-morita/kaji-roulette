import type { Schedule } from "../types";

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatSchedule(schedule: Schedule | null): string | null {
  if (!schedule) return null;
  if (schedule.type === "dayOfWeek") {
    return `毎週${WEEKDAY_LABELS[schedule.dayOfWeek]}曜`;
  }
  if (schedule.type === "dayOfMonth") {
    return `毎月${schedule.dayOfMonth}日`;
  }
  return `第${schedule.nth}${WEEKDAY_LABELS[schedule.dayOfWeek]}曜日`;
}
