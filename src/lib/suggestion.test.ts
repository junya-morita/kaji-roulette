import { describe, expect, it } from "vitest";
import { suggestCombination } from "./suggestion";
import type { Task } from "../types";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? "t",
    name: overrides.name ?? "タスク",
    description: "",
    category: "weekly",
    lastCompletedAt: null,
    enabled: true,
    estimatedMinutes: 10,
    schedule: null,
    ...overrides,
  };
}

describe("suggestCombination", () => {
  it("優先タスクは予算内であれば必ず全部含まれる", () => {
    const priority = makeTask({ id: "p1", estimatedMinutes: 10 });
    const others = [
      makeTask({ id: "o1", estimatedMinutes: 10 }),
      makeTask({ id: "o2", estimatedMinutes: 10 }),
    ];
    const result = suggestCombination(
      [priority, ...others],
      new Set(["p1"]),
      30,
    );
    expect(result.selected.some((t) => t.id === "p1")).toBe(true);
  });

  it("予算を超える組み合わせにはならない", () => {
    const tasks = [
      makeTask({ id: "a", estimatedMinutes: 20 }),
      makeTask({ id: "b", estimatedMinutes: 20 }),
      makeTask({ id: "c", estimatedMinutes: 20 }),
    ];
    const result = suggestCombination(tasks, new Set(), 30);
    expect(result.usedMinutes).toBeLessThanOrEqual(30);
    const total = result.selected.reduce(
      (sum, t) => sum + t.estimatedMinutes,
      0,
    );
    expect(total).toBe(result.usedMinutes);
    expect(total).toBeLessThanOrEqual(30);
  });

  it("優先タスク自体が予算を超える場合は除外される", () => {
    const priority = makeTask({ id: "p1", estimatedMinutes: 60 });
    const result = suggestCombination([priority], new Set(["p1"]), 30);
    expect(result.selected).toHaveLength(0);
    expect(result.usedMinutes).toBe(0);
  });

  it("候補が空なら何も選ばれない", () => {
    const result = suggestCombination([], new Set(), 30);
    expect(result.selected).toHaveLength(0);
    expect(result.usedMinutes).toBe(0);
  });

  it("予算0なら何も選ばれない", () => {
    const tasks = [makeTask({ id: "a", estimatedMinutes: 5 })];
    const result = suggestCombination(tasks, new Set(), 0);
    expect(result.selected).toHaveLength(0);
  });
});
