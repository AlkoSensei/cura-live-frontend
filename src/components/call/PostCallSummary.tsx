import { formatCostINR, getField, labelFromIntent } from "@/lib/format";
import type { CallAnalytics } from "@/types/call";

function renderSummary(summary?: Record<string, unknown> | null) {
  if (!summary || Object.keys(summary).length === 0) {
    return "No backend summary was returned for this call.";
  }

  if (typeof summary.summary === "string") {
    return summary.summary;
  }

  if (typeof summary.reason === "string") {
    return `Call ended: ${summary.reason}`;
  }

  return JSON.stringify(summary, null, 2);
}

export function PostCallSummary({ analytics }: { analytics: CallAnalytics | null }) {
  if (!analytics) {
    return (
      <section className="panel post-call-panel">
        <div className="panel-heading">
          <p className="eyebrow">Post-call</p>
          <h2>Summary</h2>
        </div>
        <p className="empty-state">End a call to see summary, extracted details, appointments, and cost.</p>
      </section>
    );
  }

  const fields = analytics.extracted_fields;

  return (
    <section className="panel post-call-panel">
      <div className="panel-heading">
        <p className="eyebrow">Post-call</p>
        <h2>Summary</h2>
      </div>

      <div className="summary-grid">
        <article className="summary-card wide">
          <span>Conversation summary</span>
          <p>{renderSummary(analytics.session.summary)}</p>
        </article>

        <article className="summary-card">
          <span>Extracted details</span>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{getField(fields, "name")}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{getField(fields, "phone_number")}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{getField(fields, "date")}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{getField(fields, "time")}</dd>
            </div>
            <div>
              <dt>Intent</dt>
              <dd>{labelFromIntent(fields?.intent)}</dd>
            </div>
          </dl>
        </article>

        <article className="summary-card summary-card--status">
          <span>Call status</span>
          <strong>{analytics.session.status}</strong>
          <p>{analytics.events.length} streamed events</p>
        </article>

        <article className="summary-card">
          <span>Estimated cost</span>
          <strong>{formatCostINR(analytics.cost.total_cost)}</strong>
          <dl>
            <div><dt>STT</dt><dd>{formatCostINR(analytics.cost.stt_cost)}</dd></div>
            <div><dt>TTS</dt><dd>{formatCostINR(analytics.cost.tts_cost)}</dd></div>
            <div><dt>LLM</dt><dd>{formatCostINR(analytics.cost.llm_input_cost + analytics.cost.llm_output_cost)}</dd></div>
          </dl>
        </article>
      </div>

      <div className="appointments-section">
        <h3>Appointments</h3>
        {analytics.appointments.length === 0 ? (
          <p className="empty-state">No appointments returned for this call.</p>
        ) : (
          <div className="appointment-grid">
            {analytics.appointments.map((appointment) => (
              <article className="appointment-card" key={appointment.id}>
                <span>{appointment.status}</span>
                <strong>{appointment.patient_name}</strong>
                <p>
                  {appointment.appointment_date} at {appointment.appointment_time}
                </p>
                {appointment.notes ? <small>{appointment.notes}</small> : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
