"use client";

import { useEffect, useRef } from "react";
import type { RemoteVideoTrack } from "livekit-client";

type CallPhase = "idle" | "creating" | "connecting" | "active" | "ended";

type VideoAvatarStageProps = {
  videoTrack: RemoteVideoTrack | null;
  localStream: MediaStream | null;
  phase: CallPhase;
  isMuted: boolean;
};

export function VideoAvatarStage({ videoTrack, localStream, phase, isMuted }: VideoAvatarStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (videoTrack) {
      videoTrack.attach(el);
      return () => { videoTrack.detach(el); };
    }
  }, [videoTrack]);

  useEffect(() => {
    const el = pipRef.current;
    if (!el || !localStream) return;
    el.srcObject = localStream;
    return () => { el.srcObject = null; };
  }, [localStream]);

  const isConnecting = (phase === "connecting" || phase === "active") && !videoTrack;
  const showVideo = !!videoTrack;

  return (
    <div className="avatar-stage avatar-stage-video">
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="avatar-video-feed"
        />
      ) : (
        <div className="avatar-video-placeholder">
          <div className="avatar-video-placeholder-card">
            <div className="avatar-video-placeholder-plate">
              {/* Placeholder avatar SVG */}
              <svg width="130" height="148" viewBox="0 0 88 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M36 72 L36 84 Q44 88 52 84 L52 72 Q44 76 36 72Z" fill="#dca37f"/>
                <path d="M16 100 L16 88 Q30 82 44 82 Q58 82 72 88 L72 100Z" fill="rgba(42,223,158,0.15)"/>
                <path d="M38 84 Q44 91 50 84 L52 90 L36 90Z" fill="rgba(255,255,255,0.08)"/>
                <ellipse cx="44" cy="44" rx="28" ry="32" fill="#dca37f"/>
                <path d="M16 38 Q16 14 44 12 Q72 14 72 38 Q66 24 44 22 Q22 24 16 38Z" fill="#1a1015"/>
                <path d="M16 38 Q13 46 16 56 Q19 48 19 40Z" fill="#1a1015"/>
                <path d="M72 38 Q75 46 72 56 Q69 48 69 40Z" fill="#1a1015"/>
                <ellipse cx="16" cy="48" rx="4" ry="5.5" fill="#dca37f"/>
                <ellipse cx="72" cy="48" rx="4" ry="5.5" fill="#dca37f"/>
                <path d="M29 36 Q36 33 42 35" stroke="#3a2010" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <path d="M46 35 Q52 33 59 36" stroke="#3a2010" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <ellipse cx="36" cy="43" rx="5.5" ry="6" fill="white"/>
                <circle cx="37" cy="44" r="3.5" fill="#3a2010"/>
                <circle cx="38" cy="42.5" r="1.2" fill="white" opacity="0.7"/>
                <ellipse cx="52" cy="43" rx="5.5" ry="6" fill="white"/>
                <circle cx="51" cy="44" r="3.5" fill="#3a2010"/>
                <circle cx="52" cy="42.5" r="1.2" fill="white" opacity="0.7"/>
                <path d="M38 62 Q44 65 50 62" stroke="#a0522d" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              </svg>
              {isConnecting && (
                <div style={{
                  position: "absolute", inset: 0,
                  borderRadius: "20px 20px 0 0",
                  background: "rgba(8,12,11,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: "2px solid var(--border)",
                    borderTopColor: "var(--teal)",
                    animation: "spin 0.9s linear infinite"
                  }} />
                </div>
              )}
            </div>
            <div className="avatar-video-placeholder-tag">
              {isConnecting ? (
                <>
                  <span className="pulse-dot" style={{ display: "inline-flex" }}>
                    <span className="pulse-dot-ring" />
                    <span className="pulse-dot-inner" />
                  </span>
                  Connecting avatar…
                </>
              ) : (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-sub)", display: "inline-block" }} />
                  Cura
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {localStream && (
        <div className="avatar-video-pip">
          <video ref={pipRef} autoPlay playsInline muted />
        </div>
      )}

      {isMuted && (
        <div className="avatar-video-muted-badge">Muted</div>
      )}
    </div>
  );
}
