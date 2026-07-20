import type { Task } from "../types";

const STORAGE_KEY = "kaji-roulette:tasks";

export function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Task[];
  } catch {
    return null;
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
