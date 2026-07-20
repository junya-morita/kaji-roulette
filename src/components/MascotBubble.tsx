type Props = {
  message: string;
  emoji?: string;
};

export function MascotBubble({ message, emoji = "🐥" }: Props) {
  return (
    <div className="mascot">
      <div className="mascot-face" aria-hidden="true">
        {emoji}
      </div>
      <div className="mascot-bubble">{message}</div>
    </div>
  );
}
