import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, Schedule, Task } from "../types";
import { loadTasks, saveTasks } from "../lib/storage";
import { isCompletedThisPeriod } from "../lib/period";
import { createDefaultTasks } from "../lib/defaultTasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(
    () => loadTasks() ?? createDefaultTasks(),
  );

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const remaining = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => t.enabled && !isCompletedThisPeriod(t, now));
  }, [tasks]);

  const weeklyRemaining = useMemo(
    () => remaining.filter((t) => t.category === "weekly"),
    [remaining],
  );
  const monthlyRemaining = useMemo(
    () => remaining.filter((t) => t.category === "monthly"),
    [remaining],
  );

  const addTask = useCallback(
    (
      name: string,
      description: string,
      category: Category,
      estimatedMinutes: number,
      schedule: Schedule | null,
    ) => {
      setTasks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name,
          description,
          category,
          lastCompletedAt: null,
          enabled: true,
          estimatedMinutes,
          schedule,
        },
      ]);
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markDone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, lastCompletedAt: new Date().toISOString() } : t,
      ),
    );
  }, []);

  const markUndone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, lastCompletedAt: null } : t)),
    );
  }, []);

  const setTaskEnabled = useCallback((id: string, enabled: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled } : t)),
    );
  }, []);

  const setTaskCategory = useCallback((id: string, category: Category) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, category, schedule: null } : t,
      ),
    );
  }, []);

  return {
    tasks,
    remaining,
    weeklyRemaining,
    monthlyRemaining,
    addTask,
    deleteTask,
    markDone,
    markUndone,
    setTaskEnabled,
    setTaskCategory,
  };
}
