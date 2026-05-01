import type {
  Appointment,
  AppointmentStatus,
  AvatarProvider,
  CallAnalytics,
  CallHistoryResponse,
  CreateLiveKitSessionResponse,
  PaginatedAppointments,
  WarmupStatus
} from "@/types/call";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Request failed");
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function createLiveKitSession(participantName: string, avatarProvider: AvatarProvider = "none") {
  return request<CreateLiveKitSessionResponse>("/api/livekit/sessions", {
    method: "POST",
    body: JSON.stringify({
      participant_identity: crypto.randomUUID(),
      participant_name: participantName || "Web Patient",
      avatar_provider: avatarProvider
    })
  });
}

export function getWarmupStatus() {
  return request<WarmupStatus>("/api/warmup", {
    cache: "no-store"
  });
}

export function endLiveKitSession(sessionId: string, endedBy = "frontend_user") {
  return request<{ ended: boolean; message: string; room_name: string; session_id: string }>(
    `/api/livekit/sessions/${sessionId}/end`,
    {
      method: "POST",
      body: JSON.stringify({
        summary: {
          ended_by: endedBy,
          ended_at: new Date().toISOString()
        }
      })
    }
  );
}

export function getCallAnalytics(sessionId: string) {
  return request<CallAnalytics>(`/api/conversations/${sessionId}/analytics`, {
    cache: "no-store"
  });
}

export function getCallHistory(page = 1, pageSize = 20) {
  const sp = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return request<CallHistoryResponse>(`/api/calls/history?${sp.toString()}`, {
    cache: "no-store"
  });
}

export function getAppointmentHistory(params: {
  page?: number;
  page_size?: number;
  search?: string;
  status?: AppointmentStatus | "";
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 1));
  sp.set("page_size", String(params.page_size ?? 20));
  if (params.search) sp.set("search", params.search);
  if (params.status) sp.set("status", params.status);
  return request<PaginatedAppointments>(`/api/appointments/history?${sp.toString()}`, {
    cache: "no-store"
  });
}

export function cancelAppointment(appointmentId: string, phoneNumber: string) {
  const sp = new URLSearchParams({ phone_number: phoneNumber });
  return request<Appointment>(`/api/appointments/${appointmentId}?${sp.toString()}`, {
    method: "DELETE"
  });
}

export { API_BASE_URL };
