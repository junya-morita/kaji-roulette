import { describe, expect, it } from "vitest";
import { getMonthStart, getWeekStart, isCompletedThisPeriod } from "./period";
import type { Task } from "../types";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "t1",
    name: "テストタスク",
    description: "",
    category: "weekly",
    lastCompletedAt: null,
    ...overrides,
  };
}

describe("getWeekStart", () => {
  it("水曜日なら同じ週の月曜0:00を返す", () => {
    // 2024-07-24 is a Wednesday
    const wed = new Date(2024, 6, 24, 15, 30);
    const start = getWeekStart(wed);
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(6);
    expect(start.getDate()).toBe(22); // Monday
    expect(start.getHours()).toBe(0);
  });

  it("日曜日ならその前の月曜0:00を返す(週の最終日扱い)", () => {
    // 2024-07-28 is a Sunday
    const sun = new Date(2024, 6, 28, 9, 0);
    const start = getWeekStart(sun);
    expect(start.getDate()).toBe(22);
  });

  it("月曜日ならその日の0:00を返す", () => {
    const mon = new Date(2024, 6, 22, 23, 59);
    const start = getWeekStart(mon);
    expect(start.getDate()).toBe(22);
    expect(start.getHours()).toBe(0);
  });
});

describe("getMonthStart", () => {
  it("月の途中の日付から1日0:00を返す", () => {
    const mid = new Date(2024, 6, 24, 12, 0);
    const start = getMonthStart(mid);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(6);
    expect(start.getHours()).toBe(0);
  });
});

describe("isCompletedThisPeriod", () => {
  it("lastCompletedAtがnullなら未完了", () => {
    const task = makeTask({ category: "weekly", lastCompletedAt: null });
    expect(isCompletedThisPeriod(task, new Date(2024, 6, 24))).toBe(false);
  });

  it("weekly: 今週内に完了していれば完了扱い", () => {
    const now = new Date(2024, 6, 24, 10, 0); // Wed
    const task = makeTask({
      category: "weekly",
      lastCompletedAt: new Date(2024, 6, 22, 8, 0).toISOString(), // Mon this week
    });
    expect(isCompletedThisPeriod(task, now)).toBe(true);
  });

  it("weekly: 先週完了していたら今週は未完了扱いに戻る", () => {
    const now = new Date(2024, 6, 24, 10, 0); // Wed
    const task = makeTask({
      category: "weekly",
      lastCompletedAt: new Date(2024, 6, 15, 8, 0).toISOString(), // 前の週の月曜
    });
    expect(isCompletedThisPeriod(task, now)).toBe(false);
  });

  it("monthly: 今月内に完了していれば完了扱い", () => {
    const now = new Date(2024, 6, 24, 10, 0);
    const task = makeTask({
      category: "monthly",
      lastCompletedAt: new Date(2024, 6, 2, 8, 0).toISOString(),
    });
    expect(isCompletedThisPeriod(task, now)).toBe(true);
  });

  it("monthly: 先月完了していたら今月は未完了扱いに戻る", () => {
    const now = new Date(2024, 6, 24, 10, 0);
    const task = makeTask({
      category: "monthly",
      lastCompletedAt: new Date(2024, 5, 30, 8, 0).toISOString(),
    });
    expect(isCompletedThisPeriod(task, now)).toBe(false);
  });
});
