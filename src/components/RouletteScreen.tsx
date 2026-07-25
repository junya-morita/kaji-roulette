import { useEffect, useRef, useState } from "react";
import type { Task } from "../types";
import { MascotBubble } from "./MascotBubble";
import { ResultCard } from "./ResultCard";
import { SuggestionCard } from "./SuggestionCard";
import {
  allDoneMessages,
  encourageMessages,
  pickRandom,
  praiseMessages,
  timeOverMessages,
} from "../lib/mascotMessages";
import { isPriorityDue } from "../lib/period";
import { suggestCombination } from "../lib/suggestion";

type Props = {
  remaining: Task[];
  weeklyRemaining: Task[];
  biweeklyRemaining: Task[];
  monthlyRemaining: Task[];
  markDone: (id: string) => void;
};

export function RouletteScreen({
  remaining,
  weeklyRemaining,
  biweeklyRemaining,
  monthlyRemaining,
  markDone,
}: Props) {
  const [spinning, setSpinning] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timeBudgetMinutes, setTimeBudgetMinutes] = useState<number | null>(
    null,
  );
  const [suggestion, setSuggestion] = useState<{
    selected: Task[];
    usedMinutes: number;
  } | null>(null);
  const [mascotMessage, setMascotMessage] = useState(() =>
    remaining.length === 0
      ? pickRandom(allDoneMessages)
      : pickRandom(encourageMessages),
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const now = new Date();
  const totalRemaining = remaining.length;
  const withinBudget = remaining.filter(
    (t) => timeBudgetMinutes == null || t.estimatedMinutes <= timeBudgetMinutes,
  );
  const priorityWithinBudget = withinBudget.filter((t) =>
    isPriorityDue(t, now),
  );
  const spinPool =
    priorityWithinBudget.length > 0 ? priorityWithinBudget : withinBudget;

  const trulyAllDone = totalRemaining === 0;
  const noneWithinBudget = !trulyAllDone && withinBudget.length === 0;

  function handleBudgetChange(value: string) {
    const next = value === "" ? null : Number(value);
    setTimeBudgetMinutes(next);
    setSuggestion(null);
    if (selectedTask || spinning || trulyAllDone) return;
    const nextWithinBudget = remaining.filter(
      (t) => next == null || t.estimatedMinutes <= next,
    );
    setMascotMessage(
      nextWithinBudget.length === 0
        ? pickRandom(timeOverMessages)
        : pickRandom(encourageMessages),
    );
  }

  function spin() {
    if (spinning || spinPool.length === 0) return;

    setSelectedTask(null);
    setSuggestion(null);
    setSpinning(true);
    setMascotMessage(pickRandom(encourageMessages));

    const pool = spinPool;
    const final = pool[Math.floor(Math.random() * pool.length)];
    const totalSteps = 18;
    let step = 0;

    function runStep() {
      step += 1;
      const isLast = step >= totalSteps;
      const shown = isLast
        ? final
        : pool[Math.floor(Math.random() * pool.length)];
      setDisplayName(shown.name);

      if (isLast) {
        setSelectedTask(final);
        setSpinning(false);
        return;
      }

      const delay = 40 + step * 12; // だんだん遅くして減速感を出す
      timeoutRef.current = window.setTimeout(runStep, delay);
    }

    runStep();
  }

  function handleDo() {
    if (!selectedTask) return;
    const categoryRemainingCount =
      selectedTask.category === "weekly"
        ? weeklyRemaining.length
        : selectedTask.category === "biweekly"
          ? biweeklyRemaining.length
          : monthlyRemaining.length;

    markDone(selectedTask.id);
    setMascotMessage(
      categoryRemainingCount <= 1
        ? pickRandom(allDoneMessages)
        : pickRandom(praiseMessages),
    );
    setSelectedTask(null);
  }

  function handleSkip() {
    setSelectedTask(null);
    setMascotMessage(pickRandom(encourageMessages));
  }

  function handleSuggest() {
    if (timeBudgetMinutes == null || trulyAllDone) return;
    const priorityIds = new Set(priorityWithinBudget.map((t) => t.id));
    const result = suggestCombination(
      withinBudget,
      priorityIds,
      timeBudgetMinutes,
    );
    setSelectedTask(null);
    setSuggestion(result);
  }

  function handleConfirmSuggestion() {
    if (!suggestion) return;
    for (const task of suggestion.selected) {
      markDone(task.id);
    }
    setMascotMessage(pickRandom(praiseMessages));
    setSuggestion(null);
  }

  const showRouletteBox = !selectedTask && !suggestion;
  const spinDisabled = spinning || spinPool.length === 0;
  const spinButtonLabel = trulyAllDone
    ? "お休みタイム"
    : noneWithinBudget
      ? "時間内にできるタスクがありません"
      : spinning
        ? "まわしてます..."
        : "まわす";

  return (
    <div className="screen roulette-screen">
      <MascotBubble message={mascotMessage} />

      <div className="time-budget-row">
        <label className="form-field">
          <span>今日使える時間(分)</span>
          <input
            type="number"
            step={5}
            min={0}
            placeholder="指定しない"
            value={timeBudgetMinutes ?? ""}
            onChange={(e) => handleBudgetChange(e.target.value)}
          />
        </label>
      </div>

      <p className="remaining-summary">
        のこり{totalRemaining}件(週1:{weeklyRemaining.length} / 隔週:
        {biweeklyRemaining.length} / 月1:{monthlyRemaining.length})
      </p>

      {showRouletteBox && (
        <div className="roulette-box">
          <div className={`roulette-display ${spinning ? "spinning" : ""}`}>
            {spinning ? displayName : trulyAllDone || noneWithinBudget ? "🎉" : "?"}
          </div>
          <button
            className="btn btn-primary btn-large"
            onClick={spin}
            disabled={spinDisabled}
          >
            {spinButtonLabel}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleSuggest}
            disabled={timeBudgetMinutes == null || trulyAllDone}
          >
            まとめて提案
          </button>
          {timeBudgetMinutes == null && (
            <p className="empty-hint">
              「今日使える時間」を設定すると使えます
            </p>
          )}
        </div>
      )}

      {selectedTask && (
        <ResultCard
          task={selectedTask}
          isPriority={isPriorityDue(selectedTask, now)}
          onDo={handleDo}
          onSkip={handleSkip}
        />
      )}

      {suggestion && (
        <SuggestionCard
          tasks={suggestion.selected}
          usedMinutes={suggestion.usedMinutes}
          budgetMinutes={timeBudgetMinutes ?? 0}
          onConfirm={handleConfirmSuggestion}
          onDismiss={() => setSuggestion(null)}
        />
      )}
    </div>
  );
}
