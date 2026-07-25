import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task, TaskFormValues } from "../types";
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
  const biweeklyRemaining = useMemo(
    () => remaining.filter((t) => t.category === "biweekly"),
    [remaining],
  );
  const monthlyRemaining = useMemo(
    () => remaining.filter((t) => t.category === "monthly"),
    [remaining],
  );

  const addTask = useCallback((values: TaskFormValues) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        lastCompletedAt: null,
        enabled: true,
        ...values,
      },
    ]);
  }, []);

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

  const updateTask = useCallback(
    (id: string, patch: Partial<Omit<Task, "id">>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  return {
    tasks,
    remaining,
    weeklyRemaining,
    biweeklyRemaining,
    monthlyRemaining,
    addTask,
    deleteTask,
    markDone,
    markUndone,
    updateTask,
  };
}
