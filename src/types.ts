export type Category = "weekly" | "biweekly" | "monthly";

export type Schedule =
  | { type: "dayOfWeek"; dayOfWeek: number } // 週1用: 0=日〜6=土
  | { type: "dayOfMonth"; dayOfMonth: number } // 月1用: 1〜31
  | { type: "nthWeekday"; nth: number; dayOfWeek: number }; // 月1用: 第nth週の何曜日か(月内での出現回数)

export type Task = {
  id: string;
  name: string;
  description: string;
  category: Category;
  lastCompletedAt: string | null;
  enabled: boolean;
  estimatedMinutes: number;
  schedule: Schedule | null;
};

/** 追加/編集フォームが扱う入力値の形(追加時にはこの形のまま渡せる) */
export type TaskFormValues = Omit<Task, "id" | "lastCompletedAt" | "enabled">;
