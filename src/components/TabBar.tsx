export type Tab = "roulette" | "list";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export function TabBar({ active, onChange }: Props) {
  return (
    <nav className="tab-bar">
      <button
        className={`tab-button ${active === "roulette" ? "active" : ""}`}
        onClick={() => onChange("roulette")}
      >
        <span className="tab-icon" aria-hidden="true">
          🎡
        </span>
        <span>ルーレット</span>
      </button>
      <button
        className={`tab-button ${active === "list" ? "active" : ""}`}
        onClick={() => onChange("list")}
      >
        <span className="tab-icon" aria-hidden="true">
          📋
        </span>
        <span>一覧</span>
      </button>
    </nav>
  );
}
