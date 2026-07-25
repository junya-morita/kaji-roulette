import { describe, expect, it } from "vitest";
import {
  getBiweeklyPeriodStart,
  getMonthStart,
  getNthWeekdayOfMonth,
  getScheduledDateInPeriod,
  getWeekStart,
  isCompletedThisPeriod,
  isPriorityDue,
} from "./period";
import type { Task } from "../types";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "t1",
    name: "テストタスク",
    description: "",
    category: "weekly",
    lastCompletedAt: null,
    enabled: true,
    estimatedMinutes: 15,
    schedule: null,
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

  it("biweekly: 同じ2週間サイクル内に完了していれば完了扱い", () => {
    const now = new Date(2024, 6, 24, 10, 0); // サイクル開始7/15
    const task = makeTask({
      category: "biweekly",
      lastCompletedAt: new Date(2024, 6, 16, 8, 0).toISOString(),
    });
    expect(isCompletedThisPeriod(task, now)).toBe(true);
  });

  it("biweekly: 前のサイクルで完了していたら未完了扱いに戻る", () => {
    const now = new Date(2024, 6, 24, 10, 0); // サイクル開始7/15
    const task = makeTask({
      category: "biweekly",
      lastCompletedAt: new Date(2024, 6, 10, 8, 0).toISOString(), // 前サイクル
    });
    expect(isCompletedThisPeriod(task, now)).toBe(false);
  });
});

describe("getBiweeklyPeriodStart", () => {
  it("基準週(2024/1/1)自体は自分自身を返す", () => {
    const start = getBiweeklyPeriodStart(new Date(2024, 0, 1, 10, 0));
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
  });

  it("次の週(サイクル2週目)は1週目の開始日を返す", () => {
    const start = getBiweeklyPeriodStart(new Date(2024, 0, 8, 10, 0));
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(0);
  });

  it("2週間後(次のサイクル)は新しい開始日を返す", () => {
    const start = getBiweeklyPeriodStart(new Date(2024, 0, 15, 10, 0));
    expect(start.getDate()).toBe(15);
    expect(start.getMonth()).toBe(0);
  });

  it("2024/7/24(水)を含むサイクルの開始は7/15", () => {
    const start = getBiweeklyPeriodStart(new Date(2024, 6, 24, 10, 0));
    expect(start.getDate()).toBe(15);
    expect(start.getMonth()).toBe(6);
  });
});

describe("getNthWeekdayOfMonth", () => {
  it("2024年7月の第3土曜日は7/20", () => {
    const date = getNthWeekdayOfMonth(2024, 6, 3, 6);
    expect(date?.getDate()).toBe(20);
  });

  it("2024年7月に第5土曜日は存在しないためnull", () => {
    const date = getNthWeekdayOfMonth(2024, 6, 5, 6);
    expect(date).toBeNull();
  });
});

describe("getScheduledDateInPeriod", () => {
  it("weekly: dayOfWeek指定は今週の該当曜日を返す(金曜)", () => {
    const now = new Date(2024, 6, 24, 10, 0); // Wed
    const task = makeTask({
      category: "weekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 }, // 金曜
    });
    const date = getScheduledDateInPeriod(task, now);
    expect(date?.getDate()).toBe(26);
  });

  it("monthly: dayOfMonth指定が月に存在しない場合はnull", () => {
    const now = new Date(2024, 5, 10); // June (30日まで)
    const task = makeTask({
      category: "monthly",
      schedule: { type: "dayOfMonth", dayOfMonth: 31 },
    });
    expect(getScheduledDateInPeriod(task, now)).toBeNull();
  });

  it("monthly: nthWeekday指定は該当日を返す", () => {
    const now = new Date(2024, 6, 24);
    const task = makeTask({
      category: "monthly",
      schedule: { type: "nthWeekday", nth: 3, dayOfWeek: 6 },
    });
    const date = getScheduledDateInPeriod(task, now);
    expect(date?.getDate()).toBe(20);
  });

  it("scheduleがnullならnull", () => {
    const now = new Date(2024, 6, 24);
    const task = makeTask({ schedule: null });
    expect(getScheduledDateInPeriod(task, now)).toBeNull();
  });

  it("biweekly: dayOfWeek指定はサイクル1週目の該当曜日を返す", () => {
    const now = new Date(2024, 6, 24, 10, 0); // サイクル開始7/15(月)
    const task = makeTask({
      category: "biweekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 }, // 金曜
    });
    const date = getScheduledDateInPeriod(task, now);
    expect(date?.getDate()).toBe(19); // 7/15の週の金曜
  });
});

describe("isPriorityDue", () => {
  it("指定曜日より前はfalse", () => {
    const before = new Date(2024, 6, 24, 10, 0); // Wed(スケジュールは金曜)
    const task = makeTask({
      category: "weekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 },
    });
    expect(isPriorityDue(task, before)).toBe(false);
  });

  it("指定曜日以降はtrue(同じ週内で持ち越される)", () => {
    const onDay = new Date(2024, 6, 26, 10, 0); // Fri
    const afterDay = new Date(2024, 6, 27, 10, 0); // Sat(見逃した翌日)
    const task = makeTask({
      category: "weekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 },
    });
    expect(isPriorityDue(task, onDay)).toBe(true);
    expect(isPriorityDue(task, afterDay)).toBe(true);
  });

  it("完了済みならfalse", () => {
    const now = new Date(2024, 6, 27, 10, 0);
    const task = makeTask({
      category: "weekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 },
      lastCompletedAt: new Date(2024, 6, 26, 8, 0).toISOString(),
    });
    expect(isPriorityDue(task, now)).toBe(false);
  });

  it("無効化されていればfalse", () => {
    const now = new Date(2024, 6, 27, 10, 0);
    const task = makeTask({
      category: "weekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 },
      enabled: false,
    });
    expect(isPriorityDue(task, now)).toBe(false);
  });

  it("毎月1日指定は月初以降ずっとtrue", () => {
    const now = new Date(2024, 6, 24, 10, 0);
    const task = makeTask({
      category: "monthly",
      schedule: { type: "dayOfMonth", dayOfMonth: 1 },
    });
    expect(isPriorityDue(task, now)).toBe(true);
  });

  it("第3土曜日指定はその日より前はfalse、以降はtrue", () => {
    const before = new Date(2024, 6, 15, 10, 0); // Mon(第3土曜日=7/20より前)
    const after = new Date(2024, 6, 24, 10, 0); // Wed(7/20より後)
    const task = makeTask({
      category: "monthly",
      schedule: { type: "nthWeekday", nth: 3, dayOfWeek: 6 },
    });
    expect(isPriorityDue(task, before)).toBe(false);
    expect(isPriorityDue(task, after)).toBe(true);
  });

  it("biweekly: サイクル1週目の指定曜日より前はfalse、以降(2週目も含め)はtrue", () => {
    const task = makeTask({
      category: "biweekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 }, // 金曜、サイクル開始7/15の週の7/19
    });
    const before = new Date(2024, 6, 17, 10, 0); // 1週目の水曜(7/19より前)
    const onDay = new Date(2024, 6, 19, 10, 0); // 1週目の金曜
    const secondWeek = new Date(2024, 6, 26, 10, 0); // 2週目の金曜(持ち越し)
    expect(isPriorityDue(task, before)).toBe(false);
    expect(isPriorityDue(task, onDay)).toBe(true);
    expect(isPriorityDue(task, secondWeek)).toBe(true);
  });

  it("biweekly: サイクルが変わると新しい該当日まで再びfalseになる", () => {
    const task = makeTask({
      category: "biweekly",
      schedule: { type: "dayOfWeek", dayOfWeek: 5 }, // 金曜
    });
    // 次のサイクルは7/29開始、その週の金曜は8/2。7/29時点ではまだ該当日前なのでfalse
    const nextCycleStart = new Date(2024, 6, 29, 10, 0);
    expect(isPriorityDue(task, nextCycleStart)).toBe(false);
  });
});
