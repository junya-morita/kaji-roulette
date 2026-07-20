import { useEffect, useRef, useState } from "react";
import type { Task } from "../types";
import { MascotBubble } from "./MascotBubble";
import { ResultCard } from "./ResultCard";
import {
  allDoneMessages,
  encourageMessages,
  pickRandom,
  praiseMessages,
} from "../lib/mascotMessages";

type Props = {
  remaining: Task[];
  weeklyRemaining: Task[];
  monthlyRemaining: Task[];
  markDone: (id: string) => void;
};

export function RouletteScreen({
  remaining,
  weeklyRemaining,
  monthlyRemaining,
  markDone,
}: Props) {
  const [spinning, setSpinning] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  const totalRemaining = remaining.length;

  function spin() {
    if (spinning || totalRemaining === 0) return;

    setSelectedTask(null);
    setSpinning(true);
    setMascotMessage(pickRandom(encourageMessages));

    const pool = remaining;
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

  return (
    <div className="screen roulette-screen">
      <MascotBubble message={mascotMessage} />

      <p className="remaining-summary">
        のこり{totalRemaining}件(週1:{weeklyRemaining.length} / 月1:
        {monthlyRemaining.length})
      </p>

      {!selectedTask && (
        <div className="roulette-box">
          <div className={`roulette-display ${spinning ? "spinning" : ""}`}>
            {spinning
              ? displayName
              : totalRemaining === 0
                ? "🎉"
                : "?"}
          </div>
          <button
            className="btn btn-primary btn-large"
            onClick={spin}
            disabled={spinning || totalRemaining === 0}
          >
            {totalRemaining === 0
              ? "お休みタイム"
              : spinning
                ? "まわしてます..."
                : "まわす"}
          </button>
        </div>
      )}

      {selectedTask && (
        <ResultCard task={selectedTask} onDo={handleDo} onSkip={handleSkip} />
      )}
    </div>
  );
}
