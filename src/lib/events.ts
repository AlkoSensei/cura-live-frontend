import { API_BASE_URL } from "@/lib/api";
import type { ConversationEvent, EventType } from "@/types/call";

const EVENT_TYPES: EventType[] = [
  "transcript",
  "tool_started",
  "tool_completed",
  "tool_failed",
  "appointment_booked",
  "call_ended",
  "usage_metrics"
];

type SubscribeOptions = {
  onEvent: (event: ConversationEvent) => void;
  onError: () => void;
};

export function subscribeToCallEvents(sessionId: string, options: SubscribeOptions) {
  const source = new EventSource(`${API_BASE_URL}/api/conversations/${sessionId}/stream`);

  const handleEvent = (event: MessageEvent<string>) => {
    try {
      options.onEvent(JSON.parse(event.data) as ConversationEvent);
    } catch {
      options.onError();
    }
  };

  EVENT_TYPES.forEach((eventType) => {
    source.addEventListener(eventType, handleEvent as EventListener);
  });

  source.onerror = () => {
    options.onError();
  };

  return () => {
    EVENT_TYPES.forEach((eventType) => {
      source.removeEventListener(eventType, handleEvent as EventListener);
    });
    source.close();
  };
}
