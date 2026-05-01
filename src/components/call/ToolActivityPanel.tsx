"use client";

import { useEffect, useRef } from "react";
import type { Appointment, ConversationEvent, ToolPayload } from "@/types/call";

const TOOL_LABELS: Record<string, string> = {
  identify_user: "Identify patient",
  fetch_slots: "Fetch slots",
  book_appointment: "Book appointment",
  retrieve_appointments: "Retrieve appointments",
  cancel_appointment: "Cancel appointment",
  modify_appointment: "Modify appointment",
  end_call: "End call",
  end_conversation: "End conversation"
};

function getToolPayload(event: ConversationEvent): ToolPayload {
  return event.payload as ToolPayload;
}

function getAppointment(event: ConversationEvent) {
  const payload = getToolPayload(event);
  return payload.data?.appointment as Appointment | undefined;
}

function isAppointment(appointment: Appointment | undefined): appointment is Appointment {
  return Boolean(appointment);
}

export function ToolActivityPanel({ events }: { events: ConversationEvent[] }) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const toolEvents = events.filter((event) =>
    ["tool_started", "tool_completed", "tool_failed", "appointment_booked"].includes(event.event_type)
  );
  const bookedAppointments = events.filter((event) => event.event_type === "appointment_booked").map(getAppointment).filter(isAppointment);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [toolEvents.length]);

  return (
    <section className="panel tool-panel">
      <div className="panel-heading">
        <p className="eyebrow">Cura actions</p>
        <h2>Tool activity</h2>
      </div>

      <div className="tool-list" ref={listRef}>
        {toolEvents.length === 0 ? (
          <p className="empty-state">Tool calls will show here when Cura identifies, books, modifies, or retrieves appointments.</p>
        ) : (
          toolEvents.map((event) => {
            const payload = getToolPayload(event);
            const label = TOOL_LABELS[payload.tool_name ?? ""] ?? payload.tool_name ?? "System action";

            return (
              <article className={`tool-item tool-${event.event_type}`} key={event.id}>
                <span className="tool-status">{event.event_type.replace("_", " ")}</span>
                <h3>{label}</h3>
                <p>{payload.message ?? "Action updated"}</p>
              </article>
            );
          })
        )}
      </div>

      {bookedAppointments.length > 0 ? (
        <div className="confirmation-stack">
          {bookedAppointments.map((appointment) => (
            <article className="appointment-card" key={appointment.id}>
              <span>Appointment confirmed</span>
              <strong>{appointment.patient_name}</strong>
              <p>
                {appointment.appointment_date} at {appointment.appointment_time}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
