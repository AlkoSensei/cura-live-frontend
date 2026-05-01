import {
  DisconnectReason,
  isAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  Track,
  type Participant,
  type TranscriptionSegment
} from "livekit-client";
import type { LiveTranscript, TranscriptRole } from "@/types/call";

type AvatarMode = {
  avatarParticipantIdentity: string;
  onAvatarVideoTrack: (track: RemoteVideoTrack | null) => void;
};

type StartLiveKitOptions = {
  url: string;
  token: string;
  participantIdentity: string;
  audioContainer: HTMLElement;
  onAgentAudioLevel: (level: number) => void;
  onConnectionChange: (state: string) => void;
  onTranscription: (transcripts: LiveTranscript[]) => void;
  onDisconnected: (reason?: DisconnectReason) => void;
  avatarMode?: AvatarMode;
};

export type LiveKitCall = {
  room: Room;
  cleanup: () => void;
};

function getTranscriptRole(participant: Participant | undefined, participantIdentity: string): TranscriptRole {
  if (!participant || participant.identity === participantIdentity) {
    return "user";
  }
  return "agent";
}

export async function startLiveKitCall(options: StartLiveKitOptions): Promise<LiveKitCall> {
  const room = new Room();
  const audioElements = new Set<HTMLMediaElement>();
  let audioLevelTimer: number | undefined;

  const attachAudioTrack = (track: RemoteTrack) => {
    const element = track.attach();
    element.autoplay = true;
    element.dataset.livekitAudio = "true";
    options.audioContainer.appendChild(element);
    audioElements.add(element);

    if (isAudioTrack(track)) {
      window.clearInterval(audioLevelTimer);
      audioLevelTimer = window.setInterval(() => {
        options.onAgentAudioLevel(track.getVolume());
      }, 120);
    }
  };

  const attachTrack = (
    track: RemoteTrack,
    _publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    const { avatarMode } = options;

    if (track.kind === Track.Kind.Video) {
      if (avatarMode && participant.identity === avatarMode.avatarParticipantIdentity) {
        avatarMode.onAvatarVideoTrack(track as RemoteVideoTrack);
      }
      return;
    }

    if (track.kind === Track.Kind.Audio) {
      if (avatarMode) {
        // In avatar mode, only play audio from the avatar participant
        if (participant.identity !== avatarMode.avatarParticipantIdentity) return;
      }
      attachAudioTrack(track);
    }
  };

  const detachTrack = (
    track: RemoteTrack,
    _publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    if (track.kind === Track.Kind.Video) {
      const { avatarMode } = options;
      if (avatarMode && participant.identity === avatarMode.avatarParticipantIdentity) {
        avatarMode.onAvatarVideoTrack(null);
      }
      return;
    }

    track.detach().forEach((element) => {
      element.remove();
      audioElements.delete(element);
    });
  };

  room.on(RoomEvent.TrackSubscribed, attachTrack);
  room.on(RoomEvent.TrackUnsubscribed, detachTrack);
  room.on(RoomEvent.ConnectionStateChanged, (state) => {
    options.onConnectionChange(String(state));
  });
  room.on(
    RoomEvent.TranscriptionReceived,
    (segments: TranscriptionSegment[], participant?: Participant) => {
      const role = getTranscriptRole(participant, options.participantIdentity);
      options.onTranscription(
        segments.map((segment) => ({
          id: segment.id,
          role,
          text: segment.text,
          is_final: segment.final,
          language: segment.language,
          received_at: Date.now()
        }))
      );
    }
  );
  room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
    options.onDisconnected(reason);
  });

  await room.connect(options.url, options.token);
  await room.localParticipant.setMicrophoneEnabled(true);

  // Attach any tracks already published before we connected
  for (const participant of room.remoteParticipants.values()) {
    for (const publication of participant.trackPublications.values()) {
      if (publication.isSubscribed && publication.track) {
        attachTrack(publication.track as RemoteTrack, publication as RemoteTrackPublication, participant);
      }
    }
  }

  return {
    room,
    cleanup: () => {
      window.clearInterval(audioLevelTimer);
      room.removeAllListeners();
      audioElements.forEach((element) => element.remove());
      if (options.avatarMode) {
        options.avatarMode.onAvatarVideoTrack(null);
      }
      room.disconnect();
    }
  };
}
