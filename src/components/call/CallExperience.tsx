"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DisconnectReason, type RemoteVideoTrack, type Room } from "livekit-client";
import { createLiveKitSession, endLiveKitSession, getCallAnalytics, getWarmupStatus } from "@/lib/api";
import { subscribeToCallEvents } from "@/lib/events";
import { startLiveKitCall } from "@/lib/livekit";
import { AvatarStage } from "@/components/call/AvatarStage";
import { CallControls } from "@/components/call/CallControls";
import { PostCallSummary } from "@/components/call/PostCallSummary";
import { ToolActivityPanel } from "@/components/call/ToolActivityPanel";
import { TranscriptPanel } from "@/components/call/TranscriptPanel";
import { VideoAvatarStage } from "@/components/call/VideoAvatarStage";
import { WarmupModal } from "@/components/call/WarmupModal";
import type { AvatarProvider, CallAnalytics, CallSession, ConversationEvent, LiveTranscript, TranscriptRole, WarmupStatus } from "@/types/call";

type CallPhase = "idle" | "creating" | "connecting" | "active" | "ended";
type DetailTab = "summary" | "conversation" | "tools";

const CALL_SECONDS = 5 * 60;
const WARMUP_POLL_MS = 3000;
const AVATAR_NAME_STORAGE_KEY = "cura-live-avatar-name";
const AVATAR_PROVIDER_OPTIONS: { value: AvatarProvider; label: string }[] = [
  { value: "none",  label: "No Avatar" },
  { value: "bey",   label: "Bey" },
  { value: "tavus", label: "Tavus" },
];

function getCheckStatus(check: WarmupStatus["checks"]["worker"] | undefined) {
  if (!check) return "warming";
  if (typeof check === "string") return check;
  if (check.ready === true) return "ready";
  return check.status ?? "warming";
}

function isWarmupReady(warmup: WarmupStatus | null) {
  return warmup?.status === "ready" && getCheckStatus(warmup.checks.worker) === "external" && getCheckStatus(warmup.checks.supabase) === "ready";
}

function getWarmupLabel(warmup: WarmupStatus | null, isChecking: boolean) {
  if (isWarmupReady(warmup)) return "Ready";
  if (isChecking) return "Checking backend";
  const worker = getCheckStatus(warmup?.checks.worker);
  const supabase = getCheckStatus(warmup?.checks.supabase);
  return `Warming up: worker ${worker}, Supabase ${supabase}`;
}

export function CallExperience() {
  const [participantName, setParticipantName] = useState("Web Patient");
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [connectionState, setConnectionState] = useState("Ready");
  const [secondsRemaining, setSecondsRemaining] = useState(CALL_SECONDS);
  const [session, setSession] = useState<CallSession | null>(null);
  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [liveTranscripts, setLiveTranscripts] = useState<LiveTranscript[]>([]);
  const [latestSpeaker, setLatestSpeaker] = useState<TranscriptRole | undefined>();
  const [agentAudioLevel, setAgentAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>("summary");
  const [warmup, setWarmup] = useState<WarmupStatus | null>(null);
  const [isWarmupChecking, setIsWarmupChecking] = useState(true);
  const [warmupModalDismissed, setWarmupModalDismissed] = useState(false);
  const [isAvatarInfoOpen, setIsAvatarInfoOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avatar provider toggle (cannot change mid-call)
  const [avatarProvider, setAvatarProvider] = useState<AvatarProvider>("none");

  // Avatar mode state (set by the session response)
  const [avatarEnabled, setAvatarEnabled] = useState(false);
  const [avatarVideoTrack, setAvatarVideoTrack] = useState<RemoteVideoTrack | null>(null);
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null);
  const avatarIdentityRef = useRef<string>("kare-avatar-agent");

  const audioContainerRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const cleanupLiveKitRef = useRef<(() => void) | null>(null);
  const cleanupEventsRef = useRef<(() => void) | null>(null);
  const isEndingRef = useRef(false);

  const handleAvatarNameChange = useCallback((name: string) => {
    setParticipantName(name);
    window.localStorage.setItem(AVATAR_NAME_STORAGE_KEY, name);
  }, []);

  const loadAnalytics = useCallback(async (sessionId: string) => {
    try {
      const response = await getCallAnalytics(sessionId);
      setAnalytics(response);
    } catch {
      setError("Call ended, but analytics are not available yet.");
    }
  }, []);

  const checkWarmup = useCallback(async () => {
    setIsWarmupChecking(true);
    try {
      const response = await getWarmupStatus();
      setWarmup(response);
      if (response.status === "ready") setError(null);
      return response;
    } catch {
      setWarmup(null);
      setError("Backend is waking up. Calls will unlock once the worker and database are ready.");
      return null;
    } finally {
      setIsWarmupChecking(false);
    }
  }, []);

  const cleanupCall = useCallback(() => {
    cleanupEventsRef.current?.();
    cleanupEventsRef.current = null;
    cleanupLiveKitRef.current?.();
    cleanupLiveKitRef.current = null;
    roomRef.current = null;
    setAgentAudioLevel(0);
    setAvatarVideoTrack(null);
    setAvatarEnabled(false);
    setSecondsRemaining(CALL_SECONDS);
    setLocalCameraStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  const mergeLiveTranscripts = useCallback((incoming: LiveTranscript[]) => {
    setLiveTranscripts((current) => {
      const byId = new Map(current.map((t) => [t.id, t]));
      incoming.forEach((t) => byId.set(t.id, t));
      return Array.from(byId.values()).sort((a, b) => a.received_at - b.received_at);
    });
    const latest = incoming.at(-1);
    if (latest) setLatestSpeaker(latest.role);
  }, []);

  const handleRoomDisconnected = useCallback(
    (reason: DisconnectReason | undefined, sessionId: string) => {
      if (reason !== DisconnectReason.ROOM_DELETED && reason !== DisconnectReason.ROOM_CLOSED) return;
      setPhase("ended");
      setActiveDetailTab("summary");
      setConnectionState(reason === DisconnectReason.ROOM_DELETED ? "Room closed by backend" : "LiveKit room closed");
      cleanupCall();
      void loadAnalytics(sessionId);
    },
    [cleanupCall, loadAnalytics]
  );

  const handleStreamCallEnded = useCallback(
    (sessionId: string) => {
      if (isEndingRef.current) return;
      isEndingRef.current = true;
      setPhase("ended");
      setActiveDetailTab("summary");
      setConnectionState("Call ended by Cura");
      cleanupCall();
      void loadAnalytics(sessionId).finally(() => { isEndingRef.current = false; });
    },
    [cleanupCall, loadAnalytics]
  );

  const finishCall = useCallback(
    async (endedBy: string) => {
      if (!session || isEndingRef.current) return;
      isEndingRef.current = true;
      setPhase("ended");
      setActiveDetailTab("summary");
      setConnectionState("Ending call");
      try {
        await endLiveKitSession(session.id, endedBy);
      } catch {
        setError("The backend end-call request failed, but the local room was disconnected.");
      } finally {
        cleanupCall();
        await loadAnalytics(session.id);
        setConnectionState("Call ended");
        isEndingRef.current = false;
      }
    },
    [cleanupCall, loadAnalytics, session]
  );

  const handleStart = useCallback(async () => {
    if (!audioContainerRef.current) return;

    if (!isWarmupReady(warmup)) {
      void checkWarmup();
      return;
    }

    setError(null);
    setAnalytics(null);
    setActiveDetailTab("conversation");
    setEvents([]);
    setLiveTranscripts([]);
    setLatestSpeaker(undefined);
    setSecondsRemaining(CALL_SECONDS);
    setPhase("creating");
    setConnectionState("Creating room");

    try {
      const response = await createLiveKitSession(participantName.trim() || "Web Patient", avatarProvider);
      setSession(response.session);

      const enabled = response.avatar_enabled ?? false;
      const identity = response.avatar_participant_identity ?? "kare-avatar-agent";
      setAvatarEnabled(enabled);
      avatarIdentityRef.current = identity;

      // Request camera permission if avatar mode is active (for local PiP — not published)
      if (enabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setLocalCameraStream(stream);
        } catch {
          // User declined or no camera — PiP simply won't show
        }
      }

      cleanupEventsRef.current = subscribeToCallEvents(response.session.id, {
        onEvent: (event) => {
          setEvents((current) => [...current, event]);
          if (event.event_type === "call_ended") {
            handleStreamCallEnded(response.session.id);
          }
        },
        onError: () => { setError("SSE stream is temporarily unavailable."); }
      });

      setPhase("connecting");
      setConnectionState("Connecting audio");

      const liveKitCall = await startLiveKitCall({
        url: response.livekit_url,
        token: response.token,
        participantIdentity: response.session.participant_identity,
        audioContainer: audioContainerRef.current,
        onAgentAudioLevel: setAgentAudioLevel,
        onConnectionChange: setConnectionState,
        onTranscription: mergeLiveTranscripts,
        onDisconnected: (reason) => handleRoomDisconnected(reason, response.session.id),
        avatarMode: enabled ? {
          avatarParticipantIdentity: identity,
          onAvatarVideoTrack: setAvatarVideoTrack
        } : undefined
      });

      roomRef.current = liveKitCall.room;
      cleanupLiveKitRef.current = liveKitCall.cleanup;
      setPhase("active");
      setConnectionState("Connected");
    } catch (startError) {
      setPhase("idle");
      setConnectionState("Ready");
      setError(startError instanceof Error ? startError.message : "Could not start the call.");
      cleanupCall();
    }
  }, [avatarProvider, checkWarmup, cleanupCall, handleRoomDisconnected, handleStreamCallEnded, mergeLiveTranscripts, participantName, warmup]);

  const handleToggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const nextMuted = !isMuted;
    await room.localParticipant.setMicrophoneEnabled(!nextMuted);
    setIsMuted(nextMuted);
  }, [isMuted]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedAvatarName = window.localStorage.getItem(AVATAR_NAME_STORAGE_KEY);
      if (savedAvatarName) setParticipantName(savedAvatarName);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      const status = await checkWarmup();
      if (cancelled || isWarmupReady(status)) return;
      timer = window.setTimeout(poll, WARMUP_POLL_MS);
    };

    void poll();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [checkWarmup]);

  useEffect(() => {
    if (!session || phase === "idle" || phase === "ended") return;

    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          void finishCall("frontend_timer");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finishCall, phase, session]);

  useEffect(() => cleanupCall, [cleanupCall]);

  const workerReady  = getCheckStatus(warmup?.checks.worker) === "ready";
  const dbReady      = getCheckStatus(warmup?.checks.supabase) === "ready";
  const overallReady = isWarmupReady(warmup);
  // Show while warming up OR briefly after ready (WarmupModal handles its own auto-dismiss)
  const showWarmupModal = !warmupModalDismissed && phase === "idle" && (!isWarmupChecking || overallReady);

  const activeDetailPanel =
    activeDetailTab === "summary" ? (
      <PostCallSummary analytics={analytics} />
    ) : activeDetailTab === "conversation" ? (
      <TranscriptPanel transcripts={liveTranscripts} />
    ) : (
      <ToolActivityPanel events={events} />
    );

  return (
    <div className="live-call-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Live Call</h1>

        <div className="avatar-provider-field" aria-label="Avatar selection">
          <button
            type="button"
            className="avatar-info-button"
            aria-label="Avatar provider information"
            aria-haspopup="dialog"
            onClick={() => setIsAvatarInfoOpen(true)}
          >
            i
          </button>
          <div className="avatar-provider-toggle" role="group" aria-label="Avatar provider">
            {AVATAR_PROVIDER_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`avatar-provider-btn${avatarProvider === value ? " avatar-provider-btn--active" : ""}`}
                disabled={phase !== "idle" && phase !== "ended"}
                onClick={() => setAvatarProvider(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="name-field">
          Avatar name
          <input
            disabled={phase !== "idle" && phase !== "ended"}
            onChange={(e) => handleAvatarNameChange(e.target.value)}
            placeholder="Avatar name"
            value={participantName}
          />
        </label>
      </div>

      {error ? <div className="error-banner" style={{ margin: "12px 20px 0" }}>{error}</div> : null}

      <div className="call-workspace">
        <div className="call-stage-shell">
          {avatarEnabled ? (
            <VideoAvatarStage
              videoTrack={avatarVideoTrack}
              localStream={localCameraStream}
              phase={phase}
              isMuted={isMuted}
            />
          ) : (
            <AvatarStage
              phase={phase}
              latestSpeaker={latestSpeaker}
              agentAudioLevel={agentAudioLevel}
              isMuted={isMuted}
              avatarName={participantName}
            />
          )}
          <CallControls
            phase={phase}
            secondsRemaining={secondsRemaining}
            isMuted={isMuted}
            connectionState={connectionState}
            canStart={(phase === "idle" || phase === "ended") && isWarmupReady(warmup)}
            warmupLabel={getWarmupLabel(warmup, isWarmupChecking)}
            onStart={handleStart}
            onToggleMute={handleToggleMute}
            onEnd={() => void finishCall("frontend_user")}
          />
        </div>

        <div className="call-detail-tabs" role="tablist" aria-label="Live call details">
          {([
            ["summary", "Summary"],
            ["conversation", "Conversation"],
            ["tools", "Tool activity"]
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              className={`call-detail-tab${activeDetailTab === tab ? " call-detail-tab--active" : ""}`}
              onClick={() => setActiveDetailTab(tab)}
              role="tab"
              aria-selected={activeDetailTab === tab}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="call-detail-panel" role="tabpanel">
          {activeDetailPanel}
        </div>
      </div>

      <div ref={audioContainerRef} className="audio-sink" aria-hidden="true" />

      {showWarmupModal && (
        <WarmupModal
          workerReady={workerReady}
          dbReady={dbReady}
          isReady={overallReady}
          onDismiss={() => setWarmupModalDismissed(true)}
        />
      )}

      {isAvatarInfoOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsAvatarInfoOpen(false)}>
          <div
            className="avatar-info-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-info-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close avatar information"
              onClick={() => setIsAvatarInfoOpen(false)}
            >
              x
            </button>
            <p className="eyebrow">Avatar Info</p>
            <h2 id="avatar-info-title">Provider Notes</h2>
            <div className="avatar-info-content">
              <p><strong>Bey</strong> stands for Beyond Presence.</p>
              <p><strong>Tavus</strong> uses Tavus AI.</p>
              <p>If either avatar provider cannot connect, the project credits may be over. Keep avatar mode off until the credits are refreshed.</p>
              <a
                className="coffee-support-box"
                href="https://buymeacoffee.com/lookie"
                target="_blank"
                rel="noreferrer"
              >
                <span className="coffee-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 8h10v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 10h2a2 2 0 1 1 0 4h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 4v1M10 4v1M13 4v1M4 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <span>
                  <strong>Buy me a coffee</strong>
                  <p>Support helps promote and keep this free project available.</p>
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
