"use client";

import { useEffect, useState } from "react";
import type { TranscriptRole } from "@/types/call";

type AvatarStageProps = {
  phase: "idle" | "creating" | "connecting" | "active" | "ended";
  latestSpeaker?: TranscriptRole;
  agentAudioLevel: number;
  isMuted: boolean;
  avatarName: string;
};

function ReceptionistFace() {
  return (
    <svg className="avatar-face" viewBox="0 0 88 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Neck */}
      <path d="M36 72 L36 84 Q44 88 52 84 L52 72 Q44 76 36 72Z" fill="#c8907a"/>
      {/* Body / scrubs — teal */}
      <path d="M16 100 L16 88 Q30 82 44 82 Q58 82 72 88 L72 100Z" fill="rgba(42,223,158,0.45)"/>
      {/* Collar highlight */}
      <path d="M38 84 Q44 91 50 84 L52 90 L36 90Z" fill="rgba(255,255,255,0.1)"/>
      {/* Head */}
      <ellipse cx="44" cy="44" rx="28" ry="32" fill="#dca37f"/>
      {/* Hair */}
      <path d="M16 38 Q16 14 44 12 Q72 14 72 38 Q66 24 44 22 Q22 24 16 38Z" fill="#1a1015"/>
      <path d="M16 38 Q13 46 16 56 Q19 48 19 40Z" fill="#1a1015"/>
      <path d="M72 38 Q75 46 72 56 Q69 48 69 40Z" fill="#1a1015"/>
      {/* Ears */}
      <ellipse cx="16" cy="48" rx="4" ry="5.5" fill="#dca37f"/>
      <ellipse cx="72" cy="48" rx="4" ry="5.5" fill="#dca37f"/>
      {/* Eyebrows */}
      <path d="M29 36 Q36 33 42 35" stroke="#3a2010" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M46 35 Q52 33 59 36" stroke="#3a2010" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="36" cy="43" rx="5.5" ry="6" fill="white"/>
      <circle cx="37" cy="44" r="3.5" fill="#3a2010"/>
      <circle cx="38" cy="42.5" r="1.2" fill="white" opacity="0.75"/>
      <ellipse cx="52" cy="43" rx="5.5" ry="6" fill="white"/>
      <circle cx="51" cy="44" r="3.5" fill="#3a2010"/>
      <circle cx="52" cy="42.5" r="1.2" fill="white" opacity="0.75"/>
      {/* Mouth */}
      <path d="M38 62 Q44 65 50 62" stroke="#a0522d" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function PatientFace() {
  return (
    <svg className="avatar-face" viewBox="0 0 88 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Neck */}
      <path d="M36 72 L36 84 Q44 88 52 84 L52 72 Q44 76 36 72Z" fill="#f0b88a"/>
      {/* Body — blue casual */}
      <path d="M16 100 L16 88 Q30 82 44 82 Q58 82 72 88 L72 100Z" fill="rgba(59,130,246,0.45)"/>
      {/* Head */}
      <ellipse cx="44" cy="44" rx="28" ry="32" fill="#f4c49f"/>
      {/* Hair — warm brown */}
      <path d="M16 38 Q16 12 44 10 Q72 12 72 38 Q66 22 44 20 Q22 22 16 38Z" fill="#6b3a1f"/>
      <path d="M16 38 Q13 46 16 56 Q19 48 19 40Z" fill="#6b3a1f"/>
      <path d="M72 38 Q75 46 72 56 Q69 48 69 40Z" fill="#6b3a1f"/>
      {/* Ears */}
      <ellipse cx="16" cy="48" rx="4" ry="5.5" fill="#f4c49f"/>
      <ellipse cx="72" cy="48" rx="4" ry="5.5" fill="#f4c49f"/>
      {/* Eyebrows */}
      <path d="M29 36 Q36 33 42 35" stroke="#6b3a1f" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M46 35 Q52 33 59 36" stroke="#6b3a1f" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="36" cy="43" rx="5.5" ry="6" fill="white"/>
      <circle cx="37" cy="44" r="3.5" fill="#3a2010"/>
      <circle cx="38" cy="42.5" r="1.2" fill="white" opacity="0.75"/>
      <ellipse cx="52" cy="43" rx="5.5" ry="6" fill="white"/>
      <circle cx="51" cy="44" r="3.5" fill="#3a2010"/>
      <circle cx="52" cy="42.5" r="1.2" fill="white" opacity="0.75"/>
      {/* Mouth */}
      <path d="M38 62 Q44 66 50 62" stroke="#a05050" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function AudioReactiveAvatar({
  kind,
  active,
}: {
  kind: "patient" | "receptionist";
  active: boolean;
}) {
  return (
    <div className={`avatar avatar-${kind} ${active ? "is-speaking" : ""}`}>
      <div className="avatar-halo" />
      {kind === "receptionist" ? <ReceptionistFace /> : <PatientFace />}
      <div className={`avatar-wave ${active ? "avatar-wave--active" : ""}`}>
        <span /><span /><span /><span /><span />
      </div>
    </div>
  );
}

export function AvatarStage({ phase, latestSpeaker, agentAudioLevel, isMuted, avatarName }: AvatarStageProps) {
  const isActive = phase === "active";
  const patientSpeaking = isActive && latestSpeaker === "user" && !isMuted;
  const receptionistSpeaking = isActive && (latestSpeaker === "agent" || agentAudioLevel > 0.03);
  const isWaiting = phase === "creating" || phase === "connecting";
  const displayAvatarName = avatarName.trim() || "You";

  const [showFarewell, setShowFarewell] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const syncFarewell = setTimeout(() => {
      setShowFarewell(phase === "ended");
    }, 0);

    if (phase === "ended") {
      t = setTimeout(() => setShowFarewell(false), 5000);
    }

    return () => {
      clearTimeout(syncFarewell);
      if (t) clearTimeout(t);
    };
  }, [phase]);

  return (
    <section className={`avatar-stage avatar-stage-${phase}`} aria-label="Cura Health call stage">
      <div className="stage-header">
        <span className="status-pill">
          {phase === "active" ? "Live with Cura" : phase === "ended" ? "Call ended" : "Virtual Front Desk"}
        </span>
        <span>{phase === "ended" ? "Call completed" : ""}</span>
      </div>

      <div className="stage-scene">
        <div className="stage-side stage-side-patient">
          <AudioReactiveAvatar kind="patient" active={patientSpeaking} />
          <div className="speech-bubble patient-bubble">
            {showFarewell ? "Goodbye!" : isMuted ? `${displayAvatarName} (muted)` : displayAvatarName}
          </div>
        </div>

        <div className="reception-desk">
          <div className="desk-top" />
          <div className="desk-front">
            <span>Cura Clinic</span>
          </div>
        </div>

        <div className="stage-side stage-side-agent">
          <AudioReactiveAvatar kind="receptionist" active={receptionistSpeaking} />
          <div className="speech-bubble agent-bubble">
            {showFarewell ? "Goodbye!" : isWaiting ? "Connecting..." : receptionistSpeaking ? "Speaking..." : "Cura"}
          </div>
          {isWaiting ? (
            <div className="connecting-dots" aria-label="Connecting">
              <span /><span /><span />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
