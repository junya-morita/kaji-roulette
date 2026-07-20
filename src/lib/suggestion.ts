import type { Task } from "../types";

function shuffle(items: Task[]): Task[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type SuggestionResult = {
  selected: Task[];
  usedMinutes: number;
};

/**
 * 優先タスクを全部(時間内で)入れてから、残り時間を他のタスクでランダムに埋める。
 * candidatesは既にenabled・未完了・時間内でフィルタ済みのものを渡す想定。
 */
export function suggestCombination(
  candidates: Task[],
  priorityIds: Set<string>,
  timeBudgetMinutes: number,
): SuggestionResult {
  const priority = shuffle(candidates.filter((t) => priorityIds.has(t.id)));
  const rest = shuffle(candidates.filter((t) => !priorityIds.has(t.id)));

  const selected: Task[] = [];
  let remainingBudget = timeBudgetMinutes;

  for (const task of [...priority, ...rest]) {
    if (task.estimatedMinutes <= remainingBudget) {
      selected.push(task);
      remainingBudget -= task.estimatedMinutes;
    }
  }

  return { selected, usedMinutes: timeBudgetMinutes - remainingBudget };
}
