export type CallStatus = "active" | "ended" | "failed";

export type EventType =
  | "transcript"
  | "tool_started"
  | "tool_completed"
  | "tool_failed"
  | "appointment_booked"
  | "call_ended"
  | "usage_metrics";

export type TranscriptRole = "user" | "agent" | "system";

export type ExtractedFields = {
  name?: string | null;
  phone_number?: string | null;
  date?: string | null;
  time?: string | null;
  intent?: string | null;
};

export type WarmupCheckDetails = {
  status?: "ready" | "warming" | "failed" | string;
  ready?: boolean;
  message?: string;
  detail?: string;
  [key: string]: unknown;
};

export type WarmupCheck = "ready" | "warming" | "failed" | string | WarmupCheckDetails;

export type WarmupStatus = {
  status: "ready" | "warming";
  checks: {
    worker: WarmupCheck;
    supabase: WarmupCheck;
  };
};

export type CallSession = {
  id: string;
  room_name: string;
  participant_identity: string;
  participant_name?: string | null;
  phone_number?: string | null;
  status: CallStatus;
  summary?: Record<string, unknown> | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string | null;
};

export type CreateLiveKitSessionResponse = {
  session: CallSession;
  room_name: string;
  livekit_url: string;
  token: string;
  avatar_enabled: boolean;
  avatar_provider?: string | null;
  avatar_participant_identity?: string | null;
};

export type AppointmentStatus = "booked" | "cancelled" | "completed";

export type PaginatedAppointments = {
  items: Appointment[];
  total: number;
  page: number;
  page_size: number;
};

export type TranscriptPayload = {
  role: TranscriptRole;
  text: string;
  is_final: boolean;
};

export type LiveTranscript = TranscriptPayload & {
  id: string;
  language?: string;
  received_at: number;
};

export type ToolPayload = {
  tool_name?: string;
  message?: string;
  data?: Record<string, unknown>;
};

export type ConversationEvent = {
  id: string;
  session_id: string;
  event_type: EventType;
  payload: Record<string, unknown>;
  created_at?: string | null;
};

export type Appointment = {
  id: string;
  patient_name: string;
  phone_number: string;
  appointment_date: string;
  appointment_time: string;
  status: "booked" | "cancelled" | "completed";
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProviderUsage = {
  stt_audio_seconds: number;
  tts_characters: number;
  llm_input_tokens: number;
  llm_output_tokens: number;
  raw_metrics: Record<string, unknown>[];
};

export type CallCost = {
  session_id: string;
  usage: ProviderUsage;
  stt_cost: number;
  tts_cost: number;
  llm_input_cost: number;
  llm_output_cost: number;
  total_cost: number;
  currency: string;
};

export type CallAnalytics = {
  session: CallSession;
  events: ConversationEvent[];
  appointments: Appointment[];
  cost: CallCost;
  extracted_fields?: ExtractedFields | null;
};

export type CallHistoryItem = {
  session: CallSession;
  tool_call_count: number;
  appointment_count: number;
  total_cost: number;
  extracted_fields?: ExtractedFields | null;
};

export type AvatarProvider = "none" | "bey" | "tavus";

export type CallHistoryResponse = {
  calls: CallHistoryItem[];
  page: number;
  page_size: number;
  total_calls: number;
  total_cost_usd: number;
  has_next: boolean;
};
