import type { Task } from "../types";

function makeId(): string {
  return crypto.randomUUID();
}

export function createDefaultTasks(): Task[] {
  const weekly: Array<[string, string, number]> = [
    ["掃除機がけ", "リビング・寝室の床にざっと掃除機をかける", 15],
    ["洗面台まわり掃除", "洗面台と鏡の水垢を拭き取る", 10],
    ["キッチンシンク掃除", "シンクとその周りを洗って軽く磨く", 10],
    ["ゴミの分別・まとめ", "各部屋のゴミをまとめて分別する", 5],
  ];
  const monthly: Array<[string, string, number]> = [
    ["換気扇の掃除", "キッチン換気扇のフィルターを外して洗う", 20],
    ["シーツ・カバー交換", "ベッドのシーツと枕カバーを洗濯して交換する", 15],
    ["冷蔵庫の中身整理", "賞味期限切れがないか確認して整理する", 15],
    ["お風呂の排水口掃除", "浴室の排水口のヌメリ・髪の毛を掃除する", 10],
  ];

  return [
    ...weekly.map(([name, description, estimatedMinutes]) => ({
      id: makeId(),
      name,
      description,
      category: "weekly" as const,
      lastCompletedAt: null,
      enabled: true,
      estimatedMinutes,
      schedule: null,
    })),
    ...monthly.map(([name, description, estimatedMinutes]) => ({
      id: makeId(),
      name,
      description,
      category: "monthly" as const,
      lastCompletedAt: null,
      enabled: true,
      estimatedMinutes,
      schedule: null,
    })),
  ];
}
