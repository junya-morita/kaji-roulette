import type { Task } from "../types";

const STORAGE_KEY = "kaji-roulette:tasks";
const DEFAULT_ESTIMATED_MINUTES = 15;

function normalizeTask(raw: Partial<Task>): Task {
  return {
    id: raw.id!,
    name: raw.name!,
    description: raw.description ?? "",
    category: raw.category!,
    lastCompletedAt: raw.lastCompletedAt ?? null,
    enabled: raw.enabled ?? true,
    estimatedMinutes: raw.estimatedMinutes ?? DEFAULT_ESTIMATED_MINUTES,
    schedule: raw.schedule ?? null,
  };
}

export function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalizeTask);
  } catch {
    return null;
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
