"use client";

import { useCallback, useEffect, useState } from "react";

const FACTS = [
  { stat: "90%",    body: "of enterprise sales interactions will be voice-first by 2027 — AI receptionists are the new front desk." },
  { stat: "24/7",   body: "availability. Cura never puts a patient on hold, never calls in sick, and answers on the first ring." },
  { stat: "<3 s",   body: "average response latency during a live Cura call — fast enough to feel like a real conversation." },
  { stat: "10 s",   body: "to generate a full post-call summary with intent, appointments, and cost breakdown." },
  { stat: "3×",     body: "more patient interactions handled versus a single human receptionist per shift." },
  { stat: "0",      body: "missed calls when an AI front desk is on duty — every patient gets an immediate answer." },
  { stat: "~1 min", body: "cold-start time on a free cloud plan. After this, all future sessions launch instantly." },
];

type CheckItem = {
  label: string;
  sublabel: string;
  done: boolean;
};

type WarmupModalProps = {
  workerReady: boolean;
  dbReady: boolean;
  isReady: boolean;
  onDismiss: () => void;
};

export function WarmupModal({ workerReady, dbReady, isReady, onDismiss }: WarmupModalProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 320);
  }, [onDismiss]);

  // Rotate facts every 4 s with a brief fade-out/in
  useEffect(() => {
    if (isReady) return;
    const t = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex((i) => (i + 1) % FACTS.length);
        setFactVisible(true);
      }, 300);
    }, 4200);
    return () => clearInterval(t);
  }, [isReady]);

  // Auto-dismiss 2 s after ready
  useEffect(() => {
    if (!isReady) return;
    const t = setTimeout(dismiss, 2000);
    return () => clearTimeout(t);
  }, [isReady, dismiss]);

  const checks: CheckItem[] = [
    { label: "Frontend",   sublabel: "App loaded successfully", done: true },
    { label: "AI worker",  sublabel: isReady || workerReady ? "Worker is online" : "Waking up the voice AI…", done: workerReady },
    { label: "Database",   sublabel: isReady || dbReady    ? "Supabase connected"  : "Connecting to Supabase…",  done: dbReady },
  ];

  const fact = FACTS[factIndex];
  const doneCount = checks.filter((c) => c.done).length;
  const progressPct = Math.round((doneCount / checks.length) * 100);

  return (
    <div className={`warmup-overlay${exiting ? " warmup-overlay--out" : ""}`} role="dialog" aria-modal="true" aria-label="Backend warming up">
      <div className="warmup-modal">

        {/* Dismiss button */}
        <button className="warmup-close" onClick={dismiss} type="button" aria-label="Dismiss">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13"/>
            <line x1="13" y1="1" x2="1" y2="13"/>
          </svg>
        </button>

        {isReady ? (
          /* ── Ready state ── */
          <div className="warmup-ready">
            <div className="warmup-ready-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="warmup-title">All set — you&apos;re good to go!</h2>
            <p className="warmup-sub">The &ldquo;Start Call&rdquo; button is now active. This window will close shortly.</p>
          </div>
        ) : (
          /* ── Loading state ── */
          <>
            {/* Animated orb */}
            <div className="warmup-orb" aria-hidden="true">
              <span className="warmup-orb-ring warmup-orb-ring-1" />
              <span className="warmup-orb-ring warmup-orb-ring-2" />
              <span className="warmup-orb-core">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                </svg>
              </span>
            </div>

            <h2 className="warmup-title">Getting Cura ready for you</h2>
            <p className="warmup-sub">
              Cura runs on a free cloud plan, so the backend needs a moment to wake up after inactivity.{" "}
              <strong>This usually takes under a minute</strong> — please keep this page open.
            </p>

            {/* Progress bar */}
            <div className="warmup-progress-track" aria-hidden="true">
              <div className="warmup-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Status checklist */}
            <ul className="warmup-checks" role="list">
              {checks.map(({ label, sublabel, done }) => (
                <li key={label} className={`warmup-check${done ? " warmup-check--done" : ""}`}>
                  <span className="warmup-check-icon" aria-hidden="true">
                    {done
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span className="warmup-spinner" />
                    }
                  </span>
                  <span className="warmup-check-text">
                    <span className="warmup-check-label">{label}</span>
                    <span className="warmup-check-sub">{sublabel}</span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Rotating fact */}
            <div className={`warmup-fact${factVisible ? " warmup-fact--visible" : ""}`} aria-live="polite">
              <span className="warmup-fact-stat">{fact.stat}</span>
              <span className="warmup-fact-body">{fact.body}</span>
            </div>

            <p className="warmup-hint">
              The &ldquo;Start Call&rdquo; button will activate automatically once all services are online.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
