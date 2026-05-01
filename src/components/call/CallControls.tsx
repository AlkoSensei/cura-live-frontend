import { formatTime } from "@/lib/format";

type CallControlsProps = {
  phase: "idle" | "creating" | "connecting" | "active" | "ended";
  secondsRemaining: number;
  isMuted: boolean;
  connectionState: string;
  canStart: boolean;
  warmupLabel: string;
  onStart: () => void;
  onToggleMute: () => void;
  onEnd: () => void;
};

export function CallControls({
  phase,
  secondsRemaining,
  isMuted,
  connectionState,
  canStart,
  warmupLabel,
  onStart,
  onToggleMute,
  onEnd
}: CallControlsProps) {
  const isInCall = phase === "creating" || phase === "connecting" || phase === "active";

  return (
    <section className="control-card">
      <div>
        <p className="eyebrow">Call window</p>
        <h2>{formatTime(secondsRemaining)}</h2>
      </div>

      <div className="control-status">
        <span className={`dot dot-${phase}`} />
        <span>{phase === "idle" ? warmupLabel : connectionState || phase}</span>
      </div>

      <div className="control-actions">
        {!isInCall ? (
          <button className="primary-button" disabled={!canStart} onClick={onStart} type="button">
            {canStart ? "Start call" : "Warming up"}
          </button>
        ) : (
          <>
            <button className="secondary-button" onClick={onToggleMute} disabled={phase !== "active"} type="button">
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button className="danger-button" onClick={onEnd} type="button">
              End call
            </button>
          </>
        )}
      </div>
    </section>
  );
}
