import { formatCostINR, formatDateTime, labelFromIntent } from "@/lib/format";
import type { CallHistoryItem } from "@/types/call";

export function HistoryPanel({
  calls,
  isLoading,
  onRefresh
}: {
  calls: CallHistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  return (
    <section className="panel history-panel">
      <div className="panel-heading panel-heading-row">
        <div>
          <p className="eyebrow">History</p>
          <h2>Recent calls</h2>
        </div>
        <button className="ghost-button" onClick={onRefresh} type="button">
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="history-list">
        {calls.length === 0 ? (
          <p className="empty-state">Recent calls will appear here after the backend records them.</p>
        ) : (
          calls.map((call) => {
            const fields = call.extracted_fields;

            return (
              <article className="history-card" key={call.session.id}>
                <div>
                  <span>{labelFromIntent(fields?.intent)}</span>
                  <h3>{fields?.name ?? "Patient not captured"}</h3>
                  <p>{fields?.phone_number ?? call.session.phone_number ?? "Phone not captured"}</p>
                </div>
                <div>
                  <strong>{formatDateTime(fields?.date, fields?.time)}</strong>
                  <p>
                    {call.session.status} · {call.tool_call_count} tools · {call.appointment_count} appointments
                  </p>
                </div>
                <strong>{formatCostINR(call.total_cost)}</strong>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
